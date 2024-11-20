import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndexFaqComponent } from './index-faq.component';

describe('IndexFaqComponent', () => {
  let component: IndexFaqComponent;
  let fixture: ComponentFixture<IndexFaqComponent>;

  // Configuración inicial antes de cada prueba
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexFaqComponent]
      // Importa el componente IndexFaqComponent para las pruebas
    })
    .compileComponents();
    // Compila los componentes

    fixture = TestBed.createComponent(IndexFaqComponent);
    // Crea una instancia del componente IndexFaqComponent
    component = fixture.componentInstance;
    // Asigna la instancia del componente a la variable component
    fixture.detectChanges();
    // Detecta los cambios iniciales en el componente
  });

  // Prueba básica para verificar que el componente se crea correctamente
  it('should create', () => {
    expect(component).toBeTruthy();
    // Verifica que la instancia del componente sea verdadera (es decir, que se haya creado correctamente)
  });
});
