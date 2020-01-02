import React, { Component } from 'react';
import './App.css';
import { Divider, InputAdornment, Switch, TextField, Typography, FormControl, MenuItem, Select, InputLabel, Paper, Container, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import payData from './payData';

class App extends Component {
  state = {
    location: 'Portland',
    xp: 'Entry',
    degree: false,
    cs: false,
    clientKnown: false,
    techClient: false,
    ability: '',
    basePay: 60,
    bonus: 0,
    background: false,
    source: 'Blend'
  }

  inputChangeHandler = (event, label) => {
    if (label === 'xp' && event.target.value === 'Entry') {
      this.setState({ [label]: event.target.value, clientKnown: false, techClient: false })
    } else {
      this.setState({ [label]: event.target.value })
    }
  }

  toggleChangeHandler = (event, label) => {
    if (label === 'background') {
      this.setState(prevState => ({ [label]: !prevState[label], ability: '' }))
    } else {
      this.setState(prevState => ({ [label]: !prevState[label] }))
    }
  }

  calcBlendedRates(source, xp, location, payType, payData) {
    if (source === 'Blend') {
      const rates = [[], [], []];
      for (const data in payData) {
        [...payData[data][xp][location][payType]].forEach((rate, index) => rates[index].push(rate))
      }
      return rates.map(rate =>
        rate.reduce((acc, curr) => acc + curr, 0) / rate.length);
    } else {
      return [...payData[source][xp][location][payType]];
    }
  }

  calcModifiers(rates, degree, cs, clientKnown, techClient, ability, xp) {
    if (ability !== '') {
      switch (ability) {
        case 0:
          rates[1] = (rates[0] * 1.1).toFixed(1);
          break;
        case 1:
          rates[1] = +((rates[0] + rates[1]) / 2).toFixed(1);
          break;
        case 2:
          break;
        case 3:
          rates[1] = +((rates[1] + rates[2]) / 2).toFixed(1);
          break;
        case 4:
          rates[1] = (rates[2] * 0.9).toFixed(1);
          break;
        default:
      }
    }

    let mod = 1;
    if (!degree) {
      if (xp === 'Entry') {
        mod -= 0.1;
      } else if (xp === 'Early Career') {
        mod -= 0.05;
      } else {
        mod -= 0.025;
      }
    }
    if (cs) {
      if (xp === 'Entry') {
        mod += 0.05;
      } else {
        mod += 0.025;
      }
    }
    if (clientKnown) {
      mod += 0.1
    }
    if (techClient) {
      mod += 0.3
    }
    rates[1] = +(rates[1] * mod).toFixed(1);
  }

  calcDiff(marketBase, marketBonus, basePay, bonus) {
    const diff = (marketBase[1] + marketBonus[1]) - (Number(basePay) + Number(bonus));
    return [((diff / (marketBase[1] + marketBonus[1])) * 100).toFixed(1), diff]
  }

  render() {
    const { location,
      xp,
      degree,
      cs,
      clientKnown,
      techClient,
      ability,
      basePay,
      background,
      source,
      bonus } = this.state;

    const marketBase = this.calcBlendedRates(source, xp, location, 'base', payData);
    const marketBonus = this.calcBlendedRates(source, xp, location, 'bonus', payData);

    if (background) {
      this.calcModifiers(marketBase, degree, cs, clientKnown, techClient, ability, xp)
      this.calcModifiers(marketBonus, degree, cs, clientKnown, techClient, ability, xp)
    }

    const diff = this.calcDiff(marketBase, marketBonus, basePay, bonus);

    return (
      <Container maxWidth="sm" className="app">
        <Paper style={{ padding: '16px', margin: '16px', width: '600px', textAlign: 'center' }}>
          <Typography variant="h2">
            What's My Value?
          </Typography>
          <Typography variant="h6" color="textSecondary">
            How Your Pay Compares to the Market
          </Typography>
        </Paper>

        <Paper style={{ padding: '16px', margin: '16px', width: '600px' }}>
          <Typography variant="h4">
            Basic Info
          </Typography>

          <FormGroup row>
            <FormControl style={{ margin: '8px' }}>
              <InputLabel id="loc-label">Location</InputLabel>
              <Select
                labelId="loc-label"
                id="loc"
                value={location}
                onChange={(event) => this.inputChangeHandler(event, 'location')}
                style={{ minWidth: '200px' }}
              >
                <MenuItem value={'Portland'}>Portland</MenuItem>
                <MenuItem value={'Denver'}>Denver</MenuItem>
                <MenuItem value={'Chicago'}>Chicago</MenuItem>
                <MenuItem value={'Boston'}>Boston</MenuItem>
                <MenuItem value={'Baltimore'}>Baltimore</MenuItem>
                <MenuItem value={'US'}>US</MenuItem>
              </Select>
            </FormControl>

            <FormControl style={{ margin: '8px' }}>
              <InputLabel id="xp-label">Experience Level</InputLabel>
              <Select
                labelId="xp-label"
                id="xp"
                value={xp}
                onChange={(event) => this.inputChangeHandler(event, 'xp')}
                style={{ minWidth: '200px' }}
              >
                <MenuItem value={'Entry'}>Entry</MenuItem>
                <MenuItem value={'Early Career'}>Early Career</MenuItem>
                <MenuItem value={'Mid Career'}>Mid Career</MenuItem>
              </Select>
            </FormControl>
          </FormGroup>

          <FormControlLabel style={{ margin: '8px 8px 8px 0' }}
            control={
              <Switch
                checked={background}
                onChange={(event) => this.toggleChangeHandler(event, 'background')}
                value={background}
                color="primary"
              />
            }
            label="Background"
          />

          {background && <div>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={degree}
                    onChange={(event) => this.toggleChangeHandler(event, 'degree')}
                    value={degree}
                    color="primary"
                  />
                }
                label="4-year Degree"
              />

              {degree && <FormControlLabel
                control={
                  <Checkbox
                    checked={cs}
                    onChange={(event) => this.toggleChangeHandler(event, 'cs')}
                    value={cs}
                    color="primary"
                  />
                }
                label="CS Major (or related field)"
              />}
            </FormGroup>

            {xp !== 'Entry' && <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clientKnown}
                    onChange={(event) => this.toggleChangeHandler(event, 'clientKnown')}
                    value={clientKnown}
                    color="primary"
                  />
                }
                label="Well-Known Company"
              />

              {clientKnown && <FormControlLabel
                control={
                  <Checkbox
                    checked={techClient}
                    onChange={(event) => this.toggleChangeHandler(event, 'techClient')}
                    value={techClient}
                    color="primary"
                  />
                }
                label="Known for Tech"
              />}
            </FormGroup>}

            <FormControl style={{ marginBottom: '8px' }}>
              <InputLabel id="qual-label">Ability</InputLabel>
              <Select
                labelId="qual-label"
                id="qual"
                value={ability}
                onChange={(event) => this.inputChangeHandler(event, 'ability')}
                style={{ minWidth: '200px' }}
              >
                <MenuItem value={0}>Low End</MenuItem>
                <MenuItem value={1}>Below Average</MenuItem>
                <MenuItem value={2}>Average</MenuItem>
                <MenuItem value={3}>Above Average</MenuItem>
                <MenuItem value={4}>Top Performer</MenuItem>
              </Select>
            </FormControl>
          </div>}

          <FormGroup row>
            <TextField id="cat-pay" label="Base Pay" value={basePay} onChange={(event) => this.inputChangeHandler(event, 'basePay')} InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">k</InputAdornment>
            }} style={{ width: '100px', margin: '8px' }} />

            <TextField id="cat-bon" label="Bonus Pay" value={bonus} onChange={(event) => this.inputChangeHandler(event, 'bonus')} InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">k</InputAdornment>
            }} style={{ width: '100px', margin: '8px' }} />
          </FormGroup>

          <FormControl style={{ margin: '8px' }}>
            <InputLabel id="source-label">Date Source</InputLabel>
            <Select
              labelId="source-label"
              id="source"
              value={source}
              onChange={(event) => this.inputChangeHandler(event, 'source')}
              style={{ minWidth: '200px' }}
            >
              <MenuItem value={'Blend'}>Blend</MenuItem>
              <MenuItem value={'PayScale'}>PayScale</MenuItem>
              <MenuItem value={'LinkedIn'}>LinkedIn</MenuItem>
              <MenuItem value={'GlassDoor'}>GlassDoor</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Paper style={{ padding: '16px', margin: '16px', width: '600px' }}>
          <Typography variant="h4">
            Market Value
          </Typography>

          <div style={{ display: 'flex', margin: '8px', flexDirection: 'column' }}>
            <Typography variant="h6">
              {`Total Compensation: $${(marketBase[1] + marketBonus[1]).toFixed(1)}k`}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary">{`Range: $${(marketBase[0] + marketBonus[0]).toFixed(1)}k - $${(marketBase[2] + marketBonus[2]).toFixed(1)}k`}</Typography>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ margin: '8px' }}>
              <Typography variant="h6">
                {`Base Pay: $${marketBase[1]}k`}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">{`Range: $${(marketBase[0]).toFixed(1)}k - $${(marketBase[2]).toFixed(1)}k`}</Typography>
            </div>

            <div style={{ margin: '8px 8px 8px 48px' }}>
              <Typography variant="h6">
                {`Bonus Pay: $${marketBonus[1]}k`}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">{`Range: $${(marketBonus[0]).toFixed(1)}k - $${(marketBonus[2]).toFixed(1)}k`}</Typography>
            </div>
          </div>

          <Divider />

          <Typography variant="h6" style={{ margin: '8px' }}>
            {`You make ${Math.abs(diff[0])}% ($${Math.abs(diff[1]).toFixed(1)}k) ${diff[1] >= 0 ? 'LESS' : 'MORE'} than your market rate.`}
          </Typography>
        </Paper>
      </Container>
    );
  }
}

export default App;
