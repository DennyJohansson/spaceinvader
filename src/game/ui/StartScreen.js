import React, { Component } from 'react';

class StartScreen extends Component {
    getClassNames(){
        //console.log('checkScreen =>', this.props.screen);
        if(this.props.screen === 'start'){
           return 'App--Ui-Screen';
        }
        return "App--Ui-Hide"; 
    }

    render() {
        return (
            <div
                className={this.getClassNames()}>
                <span className='App-Ui-Heading'>
                    <p>Space Invaders</p>
                </span>
                <span className='App--Ui-Play'>
                    <p>Click screen to play</p>
                </span>
                <span className="App--Ui-Controls" >
                <p>Use [A][D] or [←][→] to MOVE</p>
                <p>Use [SPACE] to SHOOT</p>
                </span>
               
            </div>
        );
    }
}

export default StartScreen;
// <span><p>hi-score: {this.props.topScore}</p></span>