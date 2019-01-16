class Data {
    constructor() {
        this.ListObjects = undefined;
        this.MagicTerms = undefined;
        this.RollingCharts = undefined;
        this.RandomCharts = undefined;
        this.Game = undefined;
    }

    newGame(numPlayers){
        let rGame = this.RandomCharts().random(numPlayers);

        //if (rGame.BuildType.toLowerCase() == "{roll}"){
        //    rGame.BuildType = this.RollingCharts.random()
        //}

        //this.Game = 
    }
}

class ListObjects {
    constructor(data) {
        this.Items = [];
        
        for(let i = 0; i < data.length; i++){
            this.Items.push(new ListObject(data[i]));
        }
    }

    findByNameAndType(name, type) {
        for(let i = 0; i < this.Items.length; i++){
            if (this.Items[i].Name.toLowerCase() == name.toLowerCase() &&
                this.Items[i].Type.toLowerCase() == type.toLowerCase())
                return this.Items[i];
        }
        return undefined;
    }
}
class ListObject {
    constructor(data) {
        this.Name = FormatString(data.Name);
        this.Description = FormatString(data.Description);
        this.GameRules = FormatString(data.GameRules);
        this.IsSupplemental = FormatBool(data.IsSupplemental);
        this.IsAddon = FormatBool(data.IsAddon);
        this.Type = FormatString(data.Type);
    }
}

class MagicTerms {
    constructor(data){
        this.Items = [];

        for(let i = 0; i < data.length; i++){
            this.Items.push(new MagicTerm(data[i]));
        }
    }

    find(term) {
        for(let i = 0; i < this.Items.length; i++){
            if (this.Items[i].Name.toLowerCase() == term.toLowerCase()){
                return this.Items[i].Description;
            }
        }
        return "Sorry, I don't know that Magic term."
    }
}
class MagicTerm {
    constructor(data) {
        this.Name = FormatString(data.Name);
        this.Description = FormatString(data.Description);
    }
}

class RollingCharts {
    constructor(data){
        this.Items = [];
        for(let i = 0; i < data.length; i++){
            this.Items.push(new RollingChart(data[i]));
        }
    }

    random(type, exclude) {
        let list = [];
        let item;
        let range = 0;

        if (exclude== undefined) { exclude = ""; }

        //add items to list
        for(let i = 0; i < this.Items.length; i++) {
            item = this.Items[i]; 
            if (item.ChartType.toLowerCase() == type.toLowerCase() &&
                item.Name.toLowerCase() != exclude.toLowerCase() && //Exclude these options (used for roll again and not:assassin)
                item.IsAddon == false &&        //ADDON
                item.IsSupplemental == false)   //SUPPLEMENTAL
                {
                    list.push(item);
                    range += item.Chance;
                }
        }

        let roll = Math.floor((Math.random() * range) + 1);
        for(let i = 0; i < list.length; i++){
            if (roll <= list[i].Chance) {
                return list[i];
            }
            else {
                roll -= list[i].Chance; //Lower roll by missed chance
            }
        }

        return "?"; // This shouldn't be reachable =(
    }
}
class RollingChart {
    constructor(data) {
        this.Id = data.Id;
        this.Name = FormatString(data.Name);
        this.Chance = data.Chance;
        this.ChartType = FormatString(data.ChartType);
        this.Announcement = FormatString(data.Announcement);
        this.IsAddon = FormatBool(data.IsAddon);
        this.IsSupplemental = FormatBool(data.IsSupplemental);
        this.IsRollAgain = FormatBool(data.IsRollAgain);
    }
}

class RandomCharts {
    constructor(data) {
        this.Items = [];

        for (let i = 0; i < data.length; i++){
            this.Items.push(new RandomChart(data[i]));
        }
    }

    random(numPlayers) {
        let list = [];
        let item;
        let range = 0;

        //Build list of options based on number of players
        for(let i = 0; i < this.Items.length; i++){
            item = this.Items[i];
            if (item.NumberOfPlayers == numPlayers){
                list.push(item);
                range += item.Chance;
            }
        }

        let roll = Math.floor((Math.random() * range) + 1);
        for(let i = 0; i < list.length; i++){
            if (roll <= list[i].Chance) {
                return list[i];
            }
            else {
                roll -= list[i].Chance; //Lower roll by missed chance
            }
        }

        return "?"; // This shouldn't be reachable =(
    }
}
class RandomChart {
    constructor(data) {
        this.Id = data.Id;
        this.Announcement = FormatString(data.Announcement);
        this.Chance = data.Chance;
        this.Description = FormatString(data.Description);
        this.BuildType = FormatString(data.BuildType);
        this.ElementType = FormatString(data.ElementType);
        this.GameType = FormatString(data.GameType);
        this.Name = FormatString(data.Name);
        this.NumberOfPlayers = data.NumberOfPlayers;
        this.Team = FormatString(data.team);
        this.TeamType = FormatString(data.TeamType);
        this.TeamSlots = data.TeamSlots;
    }
}


class GameObject {
    constructor() {
        this.Game = undefined;
        this.StartedDatetime = new Date();
        this.GameType = undefined;
        this.BuildType = undefined;
        this.ElementType = undefined;
        this.SubElementType = undefined;
        this.TeamType = undefined;
    }


}


function FormatString(data) {
    if (data == undefined) { return ""; }
    return data;
}

function FormatBool(data) {
    if (data == undefined) { return false; }
    return data;
}

exports.ListObjects = ListObjects;
exports.MagicTerms = MagicTerms;
exports.RollingCharts = RollingCharts;
exports.RandomCharts = RandomCharts;
exports.GameObject = GameObject;
exports.Data = Data;

