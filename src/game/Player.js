import React, { Component } from 'react';

class Player extends Component {
    //userExplode
    getClassNames(){
        if(this.props.userExplode){
            if(!this.props.userShow){
                return "App--Game--Player App--Game--Player-Hide";
            }
            return "App--Game--Player App--Game--Player-Explode";
        }
        if(!this.props.userShow){
            return "App--Game--Player App--Game--Player-Hide";
        }
        return "App--Game--Player App--Game--Player-Life";
    }
    render() {
        let styles = {
            top: this.props.userTop,
            left: this.props.userLeft,
            width: this.props.userWidth,
            height: this.props.userHeight
        }
        return (
            <div
                className={this.getClassNames()}
                style={styles}      
            >

            </div>
        );
    }
}

export default Player;