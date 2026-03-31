import { GameData } from './GameData';
import { Component, ViewChild } from '@angular/core';


// On doit commencer par ajouter signalr dans les node_modules: npm install @microsoft/signalr
import * as signalR from "@microsoft/signalr"
import { HangmanComponent } from './components/hangman/hangman.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(HangmanComponent)
  private hangman!:HangmanComponent;

  private hubConnection?: signalR.HubConnection

  isConnected: boolean = false;
  letter:string = "";
  wronglyGuessedWord:string = "";

  gameData:GameData | undefined;

  constructor(){
    this.connectToHub();
  }

  connectToHub() {
    this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl('http://localhost:5030/Pendu')
                              .build();

      this.hubConnection!.on('GameData', (data:GameData) => {
        console.log("Data:");
        console.log(data);
        this.gameData = data;
        this.hangman.restart(data.nbWrongGuesses);
      });

      this.hubConnection!.on('Event', (event) => {
        console.log("Event:");
        console.log(event);
        this.applyEvent(event);
      });

      this.hubConnection
      .start()
      .then(() => {
        console.log("Connected");
        this.isConnected = true;

      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  startGame(){
    this.hubConnection?.invoke("StartGame");
  }

  guessWord(){
    this.hubConnection?.invoke("GuessLetter", this.letter.at(0));
    this.letter = "";
  }

  canStartNewGame(){
    return this.gameData == null || this.gameData.lost || this.gameData.won;
  }

  async applyEvent(event:any){
    if(this.gameData)
    {
      switch(event.eventType){
        case "WrongGuess": {
          this.gameData.nbWrongGuesses++;
          this.hangman.showMore();
          break;
        }
        case "RevealLetter": {
          this.gameData.revealedWord = this.setCharAt(this.gameData.revealedWord, event.index, event.letter);
          break;
        }
        case "GuessedLetter": {
          this.gameData.guessedLetters.push(event.letter);
          break;
        }
        case "Win": {
          this.gameData.won =true
          break;
        }
          case "Lose": {
          this.gameData.lost = true
          this.wronglyGuessedWord = event.word
          break;
        }
      }

      if(event.events){
        for(let e of event.events){
          await this.applyEvent(e);
        }
      }
    }
  }

  setCharAt(str:string, index:number, chr:string) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}
}
