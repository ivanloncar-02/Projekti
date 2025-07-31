import React, { Component } from "react";
import styles from './audioPlayer.module.css'
import ReactPlayer from "react-player";
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FaCircleStop } from "react-icons/fa6";

class AudioPlayer extends Component {
    constructor(props){
      super(props)
      this.state = {
        url: this.props.selectedStation?.url,
        playing: true,
        controls: true,
        light: false,
        volume: 0.1,
        muted: false,
        played: 0,
        loaded: 0,
        duration: 0,
        playbackRate: 1.0,
        loop: false
      }
      if(this.props.selectedStation?.url){
        this.state.url = this.props.selectedStation?.url
      }
    }
  
    componentDidUpdate(prevProps, prevState) {
      // Check if the url has changed
      if (this.state.url !== prevState.url) {
        // Call the load function when the url changes
        this.setState({url: this.props.selectedStation?.url});
      }
    }

    load = url => {
      this.setState({
        url: this.state.url,
        played: 0,
        loaded: 0,
        pip: false
      })
    }
  
    handlePlayPause = () => {
      this.setState({ playing: !this.state.playing })
    }
  
    handleStop = () => {
      this.setState({ url: null, playing: false })
    }
  
    handleToggleControls = () => {
      const url = this.state.url
      this.setState({
        controls: !this.state.controls,
        url: null
      }, () => this.load(url))
    }
  
    handleToggleLight = () => {
      this.setState({ light: !this.state.light })
    }
  
    handleToggleLoop = () => {
      this.setState({ loop: !this.state.loop })
    }
  
    handleVolumeChange = e => {
      this.setState({ volume: parseFloat(e.target.value) })
    }
  
    handleToggleMuted = () => {
      this.setState({ muted: !this.state.muted })
    }
  
    handleSetPlaybackRate = e => {
      this.setState({ playbackRate: parseFloat(e.target.value) })
    }
  
    handleOnPlaybackRateChange = (speed) => {
      this.setState({ playbackRate: parseFloat(speed) })
    }
  
    handlePlay = () => {
      console.log('onPlay')
      this.setState({ playing: true })
    }
  
    handlePause = () => {
      console.log('onPause')
      this.setState({ playing: false })
    }
  
    handleSeekMouseDown = e => {
      this.setState({ seeking: true })
    }
  
    handleSeekChange = e => {
      this.setState({ played: parseFloat(e.target.value) })
    }
  
    handleSeekMouseUp = e => {
      this.setState({ seeking: false })
      this.player.seekTo(parseFloat(e.target.value))
    }
  
    handleProgress = state => {
      console.log('onProgress', state)
      // We only want to update time slider if we are not currently seeking
      if (!this.state.seeking) {
        this.setState(state)
      }
    }
  
    handleEnded = () => {
      console.log('onEnded')
      this.setState({ playing: this.state.loop })
    }
  
    handleDuration = (duration) => {
      console.log('onDuration', duration)
      this.setState({ duration })
    }
    
    renderLoadButton = (url, label) => {
        return (
          <button onClick={() => this.load(url)}>
            {label}
          </button>
        )
    }

    ref = player => {
        this.player = player
    }

    render () {
        const { url, playing, controls, light, volume, muted, loop, played, loaded, duration, playbackRate } = this.state
        return(
            <div className={styles.audioPlayerContainer}>
                <ReactPlayer
                ref={this.ref}
                className='react-player'
                width={600}
                height={50}
                url={url}
                playing={playing}
                controls={controls}
                light={light}
                loop={loop}
                playbackRate={playbackRate}
                volume={volume}
                muted={muted}
                onReady={() => console.log('onReady')}
                onStart={() => console.log('onStart')}
                onPlay={this.handlePlay}
                onPause={this.handlePause}
                onBuffer={() => console.log('onBuffer')}
                onPlaybackRateChange={this.handleOnPlaybackRateChange}
                onSeek={e => console.log('onSeek', e)}
                onEnded={this.handleEnded}
                onError={e => console.log('onError', e)}
                onProgress={this.handleProgress}
                onDuration={this.handleDuration}
                onPlaybackQualityChange={e => console.log('onPlaybackQualityChange', e)}
                />
                <tr>
                    <th>Controls</th>
                    <td>
                        <button onClick={this.handleStop}><FaCircleStop /></button>
                        <button onClick={this.handlePlayPause}>{playing ? <FaCirclePause /> : <FaCirclePlay />}</button>
                    <td>
                        <input type='range' min={0} max={1} step='any' value={volume} onChange={this.handleVolumeChange} />
                    </td>
                    </td>
                    <th>Custom URL</th>
                    <td>
                        <input ref={input => { this.urlInput = input }} type='text' placeholder='Enter URL' />
                        <button onClick={() => this.setState({ url: this.urlInput.value })}>Load</button>
                    </td>
                </tr>
            </div>
        )
    }
}

export default AudioPlayer