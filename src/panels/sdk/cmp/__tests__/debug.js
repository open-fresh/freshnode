import React from 'react'; // eslint-disable-line import/no-unresolved
import { render, fireEvent } from 'react-testing-library';
import Debug from '../Debug';

describe('Debug cmp', () => {
  it('renders greeting and counter', () => {
    const { container } = render(<Debug greeting="Hello World" counter={15} />);

    expect(container).toHaveTextContent('Hello World');
    expect(container).toHaveTextContent('Counter: 15');
  });

  it('handles onIncrement', () => {
    const onIncrement = jest.fn();
    const { container } = render(
      <Debug greeting="Hello World" counter={15} onIncrement={onIncrement} />
    );

    fireEvent(
      container.querySelector('button'),
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );

    expect(onIncrement.mock.calls.length).toBe(1);
  });
});
