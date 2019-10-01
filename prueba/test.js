var hola = "Hello";
function clip(params) {
    let number = 9 * 4;
    return number / 2 * 8 + 4;
}
let app = new Vue({
    el:"#app",
    data:{bool: false,
num: 4,obj: {
            name: "Louis",lastname:"walker"
},
        arr: ["my","name","is",
         "skrillex"],
        str: "comment"
    },
    methods:{
        workingData(){
            let double = this.num * this.num;
        }
    },
    computed:{
        action(){
            return this.bool? "true": "false";
        }
    }
});
function name(params) {
    if(!params)
        return null;
    return "cosas";
}