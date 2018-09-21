export function readTemplateVars(variableSrv) {
  return variableSrv.variables.reduce((acc, v) => {
    if (v && v.current) {
      acc[v.name] = v.current.value;
    }

    return acc;
  }, {});
}

export function writeTemplateVars(
  scope,
  timeSrv,
  variableSrv,
  vars,
  forceRefresh
) {
  const updates = Object.keys(vars).reduce((acc, key) => {
    const update = updateTemplateVar(scope, variableSrv, key, vars[key]);
    if (update) {
      acc.push(update);
    }
    return acc;
  }, []);

  if (updates.length || forceRefresh) {
    return Promise.all(updates).then(() => timeSrv.refreshDashboard());
  }

  return Promise.resolve();
}

function updateTemplateVar(scope, variableSrv, varName, varValue) {
  const variable = variableSrv.variables.find(v => v.name === varName);
  if (variable && variable.current.value !== varValue) {
    const option =
      variable.options && variable.options.find(o => o.value === varValue);
    if (option) {
      // options are predefined
      return variableSrv
        .setOptionAsCurrent(variable, option)
        .then(() => scope.$emit('template-variable-value-updated'));
    }

    // options are not predefined
    variable.current.selected = true;
    variable.current.text = varValue;
    variable.current.value = varValue;
    variable.options = [variable.current];
    return variableSrv
      .variableUpdated(variable, false)
      .then(() => scope.$emit('template-variable-value-updated'));
  }

  return false;
}
