import { Component } from '@angular/core';
import { PickleLabelFeature } from '@miniapps/pickle-label-ui';

@Component({
  selector: 'app-root',
  imports: [PickleLabelFeature],
  template: '<lib-pickle-label-ui />',
})
export class App {}
