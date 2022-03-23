const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

class country{
  name:string;
  total_area:number;
  population:number;
  constructor(name = "No Country", total_area=0,population=0){
    this.name = name;
    this.total_area = total_area;
    this.population = population;
  }
}
const country_data:[] = [];

const fs = require('fs')

fs.readFile('countrydata.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  let re = ":"
  let co = ","
  let index:number=0;
  if (data.search(re) == -1 ) {
    console.log("Not Found" );
  } else {
    while(data.length > 0){
      let country_name:string = data.substring(0,data.search(re));
      let country_area:string = data.substring(data.search(re)+1,data.search(co));
      country_name = country_name.replace("\r\n","");
      country_area = country_area.replace("\r\n","");
      let temp_country:country=[country_name, Number(country_area)];
      country_data.push(temp_country);
      data = data.substring(data.search(co)+1,data.length);
    }
    console.log(country_data);
  }
});
type player_data = [number, string, string]; // Tuple of player score, name and room
type scoreboard_data = [number, string]
let all_players_data = new Map<string, player_data>();

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', socket => {

    socket.on('chat message', (msg: string) => {
      io.to(all_players_data.get(socket.id)?.[2]).emit('chat message', all_players_data.get(socket.id)?.[1]+"\n"+msg); // Only sends the message to other sockets with the same room id. Effectively working as private instances of quiz battles
      });
    socket.on('scoreboard-update', (new_score: number) => {
      all_players_data.get(socket.id)?.[0] = new_score;
      let temp_scoreboard: scoreboard_data[] = [];
      all_players_data.forEach((value) => {
        if(value[2] == all_players_data.get(socket.id)?.[2]){ // Only send a scoreboard update if they are in the same room
          let temp_var: scoreboard_data = [value[0],value[1]];
          temp_scoreboard.push(temp_var);
        }
      });
      console.log(temp_scoreboard);
      io.to(all_players_data.get(socket.id)?.[2]).emit('scoreboard-update', temp_scoreboard);
      });   
    socket.on('disconnect', () => {
      io.to(all_players_data.get(socket.id)?.[2]).emit('user-disconnected', all_players_data.get(socket.id)?.[1]);
      all_players_data.delete(socket.id);
      });   
    
    socket.on('new-user', ({ name, room }) => {
        var user: player_data;
        user = [0,name,room]; // When a new user joins they have the score 0
        all_players_data.set(socket.id,user); // Put that new user in the players data map
        socket.join(room);
        io.to(all_players_data.get(socket.id)?.[2]).emit('user-connected',name);
      });   
});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }

server.listen(3000, () => {
  console.log('listening on *:3000');
});