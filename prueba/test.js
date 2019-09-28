new Vue({
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
})