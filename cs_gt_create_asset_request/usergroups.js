(function(exports){
    exports.UsrGrpConstants = {
        USER_GRP_ID_ENDPOINT: "/otmmapi/usrgrpid/"
    };
    
    exports.userGrpVsSecPolicy = {};
    
    exports.userGrpVsSecPolicy.mapped = [{"groupName":"GRI", "policyId":"483"},
                                  {"groupName":"Museum", "policyId":"4795"},
                                  {"groupName":"Communications", "policyId":"5135"}];

    exports.userGrpVsSecPolicy.others = "1";


    exports.getPolicyIdforGroupName = function (userGroupsName){
        for(var idx in userGrpVsSecPolicy.mapped){
            if(isInArrGt(userGroupsName, userGrpVsSecPolicy.mapped[idx].groupName)){
                return userGrpVsSecPolicy.mapped[idx].policyId;
            }
        }
        return userGrpVsSecPolicy.others;
    }



    exports.isInArrGt = function(response, grpName){
        for(var k in response ){
            if( response[k].name == grpName) return true;
        }
        return false;
    };

    exports.getSecurityPolicyById = function(policyId,editableSecurityPoliciesList){

        for (var i in editableSecurityPoliciesList) {

            if(editableSecurityPoliciesList[i].id == policyId){
                return (editableSecurityPoliciesList[i]);
            }
        }
    }

    
})(window);
