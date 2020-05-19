import React from 'react';
import PropTypes from 'prop-types';

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return <li 
      data-pid = {this.props.pid}
      onClick = {(e) => this.props.onSelectPid(parseInt(e.target.dataset.pid))}
      className = {this.props.className}
    >
      { this.props.name }
      { this.props.children }
    </li>
  }
}

export default class List extends React.PureComponent {
  static propTypes = {
    onSelectPid: PropTypes.func,
    selectedPid: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = { selected: false };
  }
  
  list(data) {
    const children = (items) => {
    	if (items) {
        return <ul 
          className = "tree">
            { this.list(items) }
        </ul>
      }
    }
    
    return data.map((node, index) => {
      const { onSelectPid, selectedPid } = this.props;
      return <Item 
        key = { node.pid }
        pid = { node.pid }
        name = { `${node.pid.toString().padStart(5, '0')} ${node.user}: ${node.command}` }
        className = {parseInt(selectedPid) === parseInt(node.pid) ? 'selected' : ''}
        onSelectPid = {onSelectPid}
      >
        { children(node.children) }
      </Item>
    })
  }
  
  render() {
  	return <ul style={{cursor: 'pointer'}}>
    	{ this.list(this.props.data) }
    </ul>
  }
}