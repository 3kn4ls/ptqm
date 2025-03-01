import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import Keycloak from 'keycloak-js';
import {
  HasRolesDirective,
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs
} from 'keycloak-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuComponent, RouterModule],
  template: `
    <app-menu
      [authenticated]="authenticated()"
      [keycloakStatus]="keycloakStatus()"
      [keycloak]="keycloak"
      [keycloakSignal]="keycloakSignal">
    </app-menu>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [``]
})
export class AppComponent {
  authenticated = signal(false);
  keycloakStatus = signal<string | undefined>(undefined);
  keycloak = inject(Keycloak);
  keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      this.keycloakStatus.set(keycloakEvent.type);

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated.set(typeEventArgs<ReadyArgs>(keycloakEvent.args));
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated.set(false);
      }
    });
  }

}
