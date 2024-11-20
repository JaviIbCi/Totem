import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexFaqComponent } from './index-faq/index-faq.component';


@NgModule({
  declarations: [IndexFaqComponent],
  imports: [
    CommonModule
  ],
  exports: [IndexFaqComponent]
})

export class FaqModule { }
// Define la clase FaqModule que encapsula la configuración del módulo
