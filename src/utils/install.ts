import { App, Component } from "vue"

type ComponentWithInstall = {
  install?: (app: App) => void;
  name?: string;
} & Component;

export const withInstall = (comp: ComponentWithInstall) => {
  comp.install = (app) => {
    app.component(comp.name!,  comp);
  }
  return comp;
}
