var hola = "Hello";
function clip(params) {
    let number = 9 * 4;
    return number / 2 * 8 + 4;
}
let app = new Vue({
    el:"#app",
    data:{
        bool: false,
        num: 4,
        obj: {
            name: "Louis",
            lastname:"walker", 
            data: {
                years:15, 
                languages: {
                    name: "Spanish", 
                    level: "Native"
                },
                array:[ 2, 4, 5 ]
            }
        },
        arr: ["my","name","is",
         "skrillex"],
        str: "comment",
        comment: "Hola",
        onSave : true
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
let app2 = new Vue({
    el:"#app",
    data:{
        bool2: false,
        num2: 4,
        obj2: {
            name2: "Louis",
            lastname2:"walker", 
            data2: {
                years2:15, 
                languages2: {
                    name2: "Spanish", 
                    level2: "Native"
                },
                array2:[ 2, 4, 5 ]
            }
        },
        arr2: ["my","name","is",
         "skrillex"],
        str2: "comment",
        comment2: "Hola",
        onSave2: true
    },
    methods:{
        workingData2(){
            let double = this.num * this.num;
        }
    },
    computed:{
        action2(){
            return this.bool? "true": "false";
        }
    }
});
function name(params) {
    if(!params)
        return null;
    return "cosas";
}