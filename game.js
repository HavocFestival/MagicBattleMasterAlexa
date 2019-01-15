module.exports = () => {
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

    class MagicTerm {
        constructor(data) {
            this.Name = FormatString(data.Name);
            this.Description = FormatString(data.Description);
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
};