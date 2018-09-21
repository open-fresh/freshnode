// @flow
export type NavPath = {
  id: string,
  label: string,
  name: string
};

export type State = {
  templateVars: Object,
  panelState: Object
};

type setStateCallback = (state: State) => Object;
export type SetState = setStateCallback => void;
