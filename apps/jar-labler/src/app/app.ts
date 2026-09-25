import { Component } from '@angular/core';
import { JarLablerFeature } from '@miniapps/jar-labler-ui';

@Component({
  selector: 'app-root',
  imports: [JarLablerFeature],
  template: '<lib-jar-labler />',
})
export class App {}
