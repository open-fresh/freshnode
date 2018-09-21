import { readTemplateVars, writeTemplateVars } from '../template';

const mockScope = {
  $emit: jest.fn()
};
const mockTimeSrv = {
  refreshDashboard: jest.fn()
};
const mockVarSrv = {
  variables: [
    {
      name: 'ft_nav_path',
      current: {
        value: 'cluster:foo'
      }
    }
  ],
  variableUpdated: jest.fn().mockReturnValue(Promise.resolve())
};

describe('Template', () => {
  describe('readTemplateVars()', () => {
    it('parses template vars', () => {
      const vars = readTemplateVars(mockVarSrv);

      expect(vars.ft_nav_path).toBe('cluster:foo');
    });
  });

  describe('writeTemplateVars()', () => {
    it('updates vars and refreshes', () => {
      return writeTemplateVars(mockScope, mockTimeSrv, mockVarSrv, {
        ft_nav_path: 'node:bar'
      }).then(() => {
        expect(mockVarSrv.variableUpdated.mock.calls.length).toBe(1);
        expect(mockVarSrv.variableUpdated.mock.calls[0][0].name).toBe(
          'ft_nav_path'
        );
        expect(mockVarSrv.variableUpdated.mock.calls[0][0].current.value).toBe(
          'node:bar'
        );
        expect(mockScope.$emit.mock.calls.length).toBe(1);
        expect(mockTimeSrv.refreshDashboard.mock.calls.length).toBe(1);
      });
    });
  });
});
