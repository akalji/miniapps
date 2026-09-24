import { DOCUMENT } from '@angular/common';
import { Component, computed, ElementRef, inject, Input, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsQR from 'jsqr';
import { Language, languages, LanguageService } from './i18n/language.service';
import { buildLabel, LabelField, LabelPayload, MAX_FIELDS, parseLabel } from './label/label';

type Layout = 'qr' | 'compact' | 'large';
type LabelTemplate = 'standard' | 'blank';
const DEFAULT_FIELD_KEYS: Record<Language, readonly string[]> = {
  ru: ['Продукт', 'Дата упаковки', 'Состав', 'Рецепт', 'Условия хранения'],
  en: ['Product', 'Packaging date', 'Ingredients', 'Recipe', 'Storage conditions'],
  lt: ['Produktas', 'Pakavimo data', 'Sudėtis', 'Receptas', 'Laikymo sąlygos'],
  pl: ['Produkt', 'Data pakowania', 'Skład', 'Przepis', 'Warunki przechowywania'],
};

@Component({
  selector: 'lib-pickle-label-ui',
  imports: [FormsModule],
  templateUrl: './pickle-label-feature.html',
  styleUrl: './pickle-label-feature.scss',
})
export class PickleLabelFeature implements OnDestroy {
  protected readonly i18n = inject(LanguageService);
  protected readonly languages = languages;
  protected readonly maxFields = MAX_FIELDS;
  protected readonly templates: readonly LabelTemplate[] = ['standard', 'blank'];
  protected readonly selectedTemplate = signal<LabelTemplate>('standard');
  protected readonly fields = signal<readonly LabelField[]>(this.createTemplateFields('standard'));
  protected readonly visibleFields = computed(() =>
    this.fields()
      .filter((field) => field.showInPrint !== false)
      .map(({ key, value }) => ({ key: key.trim(), value: value.trim() })),
  );
  protected readonly layout = signal<Layout>('compact');
  protected readonly copies = signal(1);
  protected readonly maxCopies = 100;
  protected readonly copiesPerSheet = computed(() => {
    const capacity: Record<Layout, number> = { qr: 15, compact: 9, large: 4 };
    return capacity[this.layout()];
  });
  protected readonly printSheets = computed(() => {
    const copies = this.copies();
    const capacity = this.copiesPerSheet();
    return Array.from({ length: Math.ceil(copies / capacity) }, (_, pageIndex) =>
      Array.from(
        { length: Math.min(capacity, copies - pageIndex * capacity) },
        (_, copyIndex) => copyIndex,
      ),
    );
  });
  protected readonly scannedLabel = signal<LabelPayload | null>(null);
  protected readonly scanError = signal<
    'scanNoQr' | 'scanInvalid' | 'scanImageError' | 'cameraUnsupported' | 'cameraDenied' | 'cameraFailed' | null
  >(null);
  protected readonly isCameraActive = signal(false);
  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  @Input() embedded = false;
  @Input() set hostLanguage(value: Language | undefined) {
    if (!value) return;
    const previousLanguage = this.i18n.language();
    this.i18n.setHostLanguage(value);
    this.updateTemplateLanguage(previousLanguage, value);
  }
  protected readonly result = computed(() => buildLabel(this.fields()));
  protected readonly label = computed(() => {
    const result = this.result();
    return 'error' in result ? null : result;
  });
  protected readonly error = computed(() => {
    const result = this.result();
    return 'error' in result ? result.error : null;
  });
  private readonly document = inject(DOCUMENT);
  private nextId = 6;
  private cameraStream: MediaStream | null = null;
  private scanFrameId: number | null = null;
  private scanCanvas = this.document.createElement('canvas');

  ngOnDestroy(): void {
    this.stopCamera();
  }

  protected async startCamera(): Promise<void> {
    this.scannedLabel.set(null);
    this.scanError.set(null);
    const window = this.document.defaultView;
    if (!window?.navigator.mediaDevices?.getUserMedia) {
      this.scanError.set('cameraUnsupported');
      return;
    }

    try {
      this.cameraStream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      const video = this.cameraVideo?.nativeElement;
      if (!video) {
        this.stopCamera();
        this.scanError.set('cameraFailed');
        return;
      }
      video.srcObject = this.cameraStream;
      await video.play();
      this.isCameraActive.set(true);
      this.scanCameraFrame();
    } catch (error) {
      this.stopCamera();
      const errorName = error instanceof DOMException ? error.name : '';
      this.scanError.set(
        errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
          ? 'cameraDenied'
          : errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError'
            ? 'cameraUnsupported'
            : 'cameraFailed',
      );
    }
  }

  protected stopCamera(): void {
    const window = this.document.defaultView;
    if (this.scanFrameId !== null) window?.cancelAnimationFrame(this.scanFrameId);
    this.scanFrameId = null;
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = null;
    if (this.cameraVideo) this.cameraVideo.nativeElement.srcObject = null;
    this.isCameraActive.set(false);
  }

  private scanCameraFrame(): void {
    const video = this.cameraVideo?.nativeElement;
    const window = this.document.defaultView;
    if (!video || !window || !this.cameraStream) return;
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      this.scanCanvas.width = video.videoWidth;
      this.scanCanvas.height = video.videoHeight;
      const context = this.scanCanvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        context.drawImage(video, 0, 0, this.scanCanvas.width, this.scanCanvas.height);
        const image = context.getImageData(0, 0, this.scanCanvas.width, this.scanCanvas.height);
        const decoded = jsQR(image.data, image.width, image.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (decoded) {
          const label = parseLabel(decoded.data);
          this.scanError.set(label ? null : 'scanInvalid');
          this.scannedLabel.set(label);
          this.stopCamera();
          return;
        }
      }
    }
    this.scanFrameId = window.requestAnimationFrame(() => this.scanCameraFrame());
  }

  protected addField(): void {
    if (this.fields().length >= MAX_FIELDS) return;
    this.fields.update((fields) => [
      ...fields,
      { id: this.nextId++, key: '', value: '', showInPrint: true },
    ]);
  }

  protected selectTemplate(template: LabelTemplate): void {
    this.selectedTemplate.set(template);
    this.fields.set(this.createTemplateFields(template));
    this.nextId = this.fields().length + 1;
    this.scannedLabel.set(null);
    this.scanError.set(null);
  }

  protected changeLanguage(value: string): void {
    const previousLanguage = this.i18n.language();
    this.i18n.setLanguage(value);
    this.updateTemplateLanguage(previousLanguage, this.i18n.language());
  }

  private updateTemplateLanguage(previousLanguage: Language, language: Language): void {
    if (previousLanguage === language || this.selectedTemplate() !== 'standard') return;
    const previousKeys = DEFAULT_FIELD_KEYS[previousLanguage];
    const nextKeys = DEFAULT_FIELD_KEYS[language];
    this.fields.update((fields) =>
      fields.map((field) => {
        const defaultIndex = previousKeys.indexOf(field.key);
        return defaultIndex === -1 ? field : { ...field, key: nextKeys[defaultIndex] };
      }),
    );
  }

  private createTemplateFields(template: LabelTemplate): readonly LabelField[] {
    if (template === 'blank') return [{ id: 1, key: '', value: '' }];

    const language = this.i18n.language();
    const today = new Date();
    const packagingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return DEFAULT_FIELD_KEYS[language].map((key, index) => ({
      id: index + 1,
      key,
      value: index === 1 ? packagingDate : '',
    }));
  }

  protected updateField(id: number, property: 'key' | 'value', value: string): void {
    this.fields.update((fields) =>
      fields.map((field) => (field.id === id ? { ...field, [property]: value } : field)),
    );
  }

  protected togglePrintVisibility(id: number, showInPrint: boolean): void {
    this.fields.update((fields) =>
      fields.map((field) => (field.id === id ? { ...field, showInPrint } : field)),
    );
  }

  protected removeField(id: number): void {
    this.fields.update((fields) => fields.filter((field) => field.id !== id));
  }

  protected print(): void {
    if (this.label()) this.document.defaultView?.print();
  }

  protected updateCopies(value: number | null): void {
    if (value === null || !Number.isFinite(value)) return;
    this.copies.set(Math.max(1, Math.min(this.maxCopies, Math.floor(value))));
  }

  protected async scanImage(event: Event): Promise<void> {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.scannedLabel.set(null);
    this.scanError.set(null);
    this.stopCamera();
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = this.document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas is unavailable');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(image.data, image.width, image.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (!decoded) {
        this.scanError.set('scanNoQr');
        return;
      }
      const label = parseLabel(decoded.data);
      if (!label) {
        this.scanError.set('scanInvalid');
        return;
      }
      this.scannedLabel.set(label);
    } catch {
      this.scanError.set('scanImageError');
    } finally {
      bitmap?.close();
    }
  }
}
