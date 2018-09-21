import React from 'react'; // eslint-disable-line import/no-unresolved
import { shallowequal } from '../util/shallowequal';

// Panel subscribes to `props.ftStore` and re-renders when the store state changes.
export default class Panel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mappedProps: props.propMapper.mapProps()
    };
  }

  componentDidMount() {
    this.props.propMapper.subscribe((mappedProps) => {
      if (!shallowequal(mappedProps, this.state.mappedProps)) {
        this.setState({ mappedProps });
      }
    });
  }

  componentWillUnmount() {
    this.props.propMapper.unsubscribe();
  }

  render() {
    const Cmp = this.props.cmp;
    const props = this.state.mappedProps;

    return <Cmp {...props} />;
  }
}
