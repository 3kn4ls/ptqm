import { Component, Input, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';
import {
  HasRolesDirective,
  KeycloakEvent
} from 'keycloak-angular';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, HasRolesDirective],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @Input() authenticated!: boolean;
  @Input() keycloakStatus!: string | undefined;
  @Input() keycloak!: Keycloak;
  @Input() keycloakSignal!: Signal<KeycloakEvent>;

  constructor() {}

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout();
  }
}
