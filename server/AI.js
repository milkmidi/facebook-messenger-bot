


    function AI() {
    
    }
    var p = AI.prototype;
    p.parseString = function ( value ) {
        console.log(this.toString(), "parseString() =>"+ value);
        var str = "";
        switch( true ){
            case value === "help":
                str = "請問有什麼可以為您服務的地方？\n"
                + "[a]查詢奶綠的分機\n" 
                + "[b]查詢奶綠的電話(測試)\n"
                + "[c]客製化訊息\n" 
                + "[d]你是誰";
                break;
            case value === "a":
                str = "奶綠分機：127";
                break;
            case value === "b":
                str = "奶綠假的電話：0912345678910";
                break;
            default:
              str = "歡迎您再次使用，召喚小編請輸入 [help]";
                break;
        }
        
        return str;
        //奶綠奶綠小編return "傳了" + value + "但我聽不懂!";
    }
    p.toString = function () {
        return "[AI]";
    }
    module.exports = AI;    


