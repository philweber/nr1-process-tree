import React from 'react';
import PropTypes from 'prop-types';
import { NrqlQuery, Spinner } from 'nr1';
import List from './nested-json';

const METRICS = {
  user: {
    id: 'user',
    name: 'User',
    fn: 'latest(userName) AS user'
  },
  command: {
    id: 'command',
    name: 'Command',
    fn: 'latest(commandName) AS command'
  },
  parent: {
    id: 'parent',
    name: 'Parent Process',
    fn: 'latest(parentProcessId) AS parent'
  }
};

const COLUMNS = [
  METRICS.user,
  METRICS.command,
  METRICS.parent
];

const getTree = async(array, root) => {
  var o = {};
  array.forEach(function (a) {
    o[a.pid] = Object.assign({}, a, o[a.pid]);
    o[a.parent] = o[a.parent] || {};
    o[a.parent].children = o[a.parent].children || [];
    o[a.parent].children.push(o[a.pid]);
  });
  return o[root].children;
}

export default class ProcessTree extends React.PureComponent {
  static propTypes = {
    onSelectPid: PropTypes.func,
    entity: PropTypes.object,
    platformUrlState: PropTypes.object,
    selectedPid: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    this.loadProcessData();
    this.interval = setInterval(() => this.loadProcessData(), 15000);
  }

  componentDidUpdate({ entity, platformUrlState }) {
    if (
      entity !== this.props.entity ||
      platformUrlState !== this.props.platformUrlState
    ) {
      this.loadProcessData();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async loadProcessData() {
    const { entity, selectedPid } = this.props;

    const select = COLUMNS.map((m) => m.fn).join(', ');

    const nrql = `SELECT ${select} FROM ProcessSample
      WHERE entityGuid = '${entity.guid}' OR hostname = '${entity.name}'
      SINCE ${Math.round(new Date().getTime() / 1000) - 60}
      FACET processId LIMIT MAX`;

    const { data } = await NrqlQuery.query({
      accountId: entity.accountId,
      query: nrql,
      formatType: 'raw',
    });

    const { facets } = data.raw;
    const tableData = facets.map((facet) => {
      return {
        pid: parseInt(facet.name),
        user: facet.results[0].latest,
        command: facet.results[1].latest,
        parent: facet.results[2].latest
      };
    });

    const tree = await getTree(tableData, null);
    if (tree.length > 0 && !selectedPid) {
      this.props.onSelectPid(tree[0].pid);
    }
    this.setState({ tree });
  }

  render() {
    const { tree } = this.state;

    if (!tree) return <Spinner />;

    if (tree.length === 0) return 'No Process Sample data for this host.';

    return (
      <List 
        data = {tree}
        selectedPid = {this.props.selectedPid}
        onSelectPid = {this.props.onSelectPid}
      />
    );
  }
}
