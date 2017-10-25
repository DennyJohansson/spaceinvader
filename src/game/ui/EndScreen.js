import React, { Component } from 'react';

class EndScreen extends Component {
    getClassNames(){
        //console.log('checkScreen =>', this.props.screen);
        if(this.props.screen === 'end'){
           return 'App--Ui-Screen App--Ui-Screen-End';
        }

        return "App--Ui-Hide";
         
    }
    render() {
        
        return (
            <div className={this.getClassNames()}>
                <span className='App-Ui-Heading'>
                    <p>game over</p>
                </span>
                <span className='App-Ui-CurrScore'>
                    <p>your score: {this.props.currScore}</p>
                </span>
                <span className='App-Ui-TopScore'>
                    <p>hi-score: {this.props.topScore}</p>
                </span>
                <span className='App-Ui-PlayAgain'>
                    <p>click screen to play</p>
                </span>
            </div>
        );
    }
}

export default EndScreen;