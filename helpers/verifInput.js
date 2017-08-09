/**
 *All Regex are here for Input verification
 */


module.exports = {

    /**
     *  Escape all char
     *  Return String with escaped chars
     *  */
    protectEntry: data => {
        return data.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    },

    /**
     *  Regex for input Firstname && Lastname
     *  return true or false
     *  */
    regexName: name => {
        let reg = /^([a-zA-Z\-èêéàôîïùñç]{2,20})$/
        return reg.test(name);
    },

    /**
     * Regex for input Username
     * return true or false
     * */
    regexUsername: username => {
        let reg = /^([a-zA-Z\-0-9_]{4,20})$/
        return reg.test(username)
    },

    /**
     *  Regex Strong validation Password With One lowercase && Upercase && digit min
     *  return true or false
     *  */
    regexPassword: pass => {
        //let reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/
        let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})/
        return reg.test(pass)
    },

    /**
     *   Last Regex email W3 validation
     *   return true or false
     **/
    regexEmail: email => {
        let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ //
        return reg.test(email)
    }
}