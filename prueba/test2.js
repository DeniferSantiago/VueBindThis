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
        coca_cola: "Hola"
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