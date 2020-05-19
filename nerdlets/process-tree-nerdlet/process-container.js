import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Spinner, PlatformStateContext } from 'nr1';

import ProcessTree from './process-tree';
import ProcessDetails from './process-details';

export default class ProcessContainer extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = { selectedPid: null };
    this.selectPid = this.selectPid.bind(this);
  }

  selectPid(pid) {
    this.setState({ selectedPid: pid });
  }

  render() {
    const { entity } = this.props;
    const { selectedPid } = this.state;

    return (
      <Grid className="primary-grid">
        <GridItem columnSpan={5} className="column primary-column">
          <header className="column-header">
            <h1>Process Tree</h1>
            <p className="subtitle">Updates every 15 seconds</p>
          </header>
          <div className="primary-column-main">
            <PlatformStateContext>
              {(platformUrlState) => (
                <ProcessTree
                  entity={entity}
                  platformUrlState={platformUrlState}
                  selectedPid={selectedPid}
                  onSelectPid={this.selectPid}
                  {...this.props}
                />
              )}
            </PlatformStateContext>
          </div>
        </GridItem>
        <GridItem columnSpan={7} className="column secondary-column">
          {selectedPid ? (
            <PlatformStateContext>
              {(platformUrlState) => (
                <ProcessDetails
                  entity={entity}
                  platformUrlState={platformUrlState}
                  pid={selectedPid}
                  onSelectPid={this.selectPid}
                  {...this.props}
                />
              )}
            </PlatformStateContext>
          ) : (
            <Spinner />
          )}
        </GridItem>
      </Grid>
    );
  }
}
