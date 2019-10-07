import React, { Component } from 'react';
import { 
 View, 
 Button, 
 Text, 
 StyleSheet, 
 TextInput, 
 Alert, 
 TouchableOpacity, 
 ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';

const apiURL = 'http://demo9336585.mockable.io/login';
const USER_KEY = 'ACCESS_TOKEN';

class LoginScreen extends Component {

	static navigationOptions = ({ navigation }) => {
     const { params = {} } = navigation.state;
	    return {
	        title: "Asset Management",
	        headerTitleStyle: {
	            textAlign: 'center',
	            flexGrow:1,
	            alignSelf:'center',
	        },
	    };
	 };
	constructor() {
	  super();
	  this.state = {userName: '', password: '', loginFailed: false, isUserAlreadyLogin: false, errorMessage: '', isNetworkCallInitiated: false, isConnected: true};
	}
	componentDidMount() {
	  NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
	}

	componentWillUnmount() {
	  NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
	}

	handleConnectivityChange = isConnectedToInternet => {
	   this.setState({ isConnected: isConnectedToInternet });
	};
	render() {
		if (this.state.isNetworkCallInitiated) {
	      return (
	        <ActivityIndicator
	          animating={true}
	          style={styles.indicator}
	          size="large"
	        />
	      );
	    }
		return(
			<View style={styles.containerView}>
				<TextInput
		          style={styles.textFieldStyle}
		          placeholder="Enter Username"
		          onChangeText={(text) => this.setState({userName: text})}
        		  value={this.state.userName}
        		  underlineColorAndroid = "transparent"
        		  placeholderTextColor = {'green'}
        		  ref="username"
		        />
		        <TextInput
		          style={styles.textFieldStyle}
		          placeholder="Enter password"
		          secureTextEntry = {true}
		          underlineColorAndroid= "transparent"
		          onChangeText={(text) => this.setState({password: text})}
        		  value={this.state.password}
        		  placeholderTextColor = {'green'}
        		  ref="password"
		        />
		        <Text style={styles.simpleText}>{this.state.loginFailed ? this.state.errorMessage : ''}</Text>
		        <TouchableOpacity
		          style={styles.loginScreenButton}
		          underlayColor='#fff'
		          onPress={() => {
		          	if (this.state.userName.length === 0 || this.state.password.length === 0) {
		          		this.setState({loginFailed:true, errorMessage: "Username and Password can't be empty"});
		          	} else {
		          		this.checkInternetConntection();
		          	}
		            
		          }}
		        >
			        <Text style ={styles.loginText}>Login
			        </Text>
		        </TouchableOpacity>
			</View>
		);
	}

	checkInternetConntection = () => {
		const me  = this;
		// const isConnected = await NetInfo.isConnected.fetch();
		if(this.state.isConnected){
       	  me.validateLoginCredentials();
        } else {
       	  console.log('No Internet Connection');
       	  this.setState({loginFailed:true, errorMessage: 'No Internet Connection', isNetworkCallInitiated: false});
        }
    }

   

    validateLoginCredentials = async() => {
    	this.setState({isNetworkCallInitiated: true});
	    try {
	      let response = await fetch(apiURL,{
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({
			  username: this.state.userName,
			  password: this.state.password,
			}),
	       }
	      );

	      let responseJson = await response.json();
	      this.setState({isNetworkCallInitiated: false});
	      if (responseJson && responseJson.access_token) {
	      	AsyncStorage.setItem(USER_KEY, responseJson.access_token);
	      	this.props.navigation.navigate('Scanner', {
              itemId: 86,
              otherParam: 'additional info',
            });
	      } else {
	      	this.setState({loginFailed:true, errorMessage: 'Invalid Username and Password', isNetworkCallInitiated: false});
	      }
	      console.log(responseJson);
	    } catch (error) {
	      const errorMsg = error && error.message ? error.message : 'Login request failed';
	      console.log(errorMsg);
	      this.setState({loginFailed:true, errorMessage: errorMsg, isNetworkCallInitiated: false});
	    }
    }

    isSignedIn = () => {
	  return new Promise((resolve, reject) => {
	    AsyncStorage.getItem(USER_KEY)
	      .then(res => {
	        if (res !== null) {
	          resolve(true);
	        } else {
	          resolve(false);
	        }
	      })
	      .catch(err => reject(err));
	  });
    }

    isUserAlreadyLoginToApp = async() => {
    	const access_token = await AsyncStorage.getItem(USER_KEY);
    	return access_token;
    }
}

const styles = StyleSheet.create({
  containerView: {
  	flex: 1, 
  	alignItems: 'center', 
  	justifyContent: 'center', 
  	paddingBottom: 0,
  },
  textFieldStyle: {
  	height: 40, 
  	width: "80%", 
  	textAlign:'center',
  	marginBottom: 15,
  	borderBottomWidth: 1,
    borderBottomColor: 'green',
  },	
  simpleText: { 
    fontSize: 13, 
    padding: 2, 
    marginTop: 2,
    color:'red',
  },
  loginScreenButton:{
  	width: "80%",
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'#00B9F1',
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  loginText:{
      color:'#fff',
      textAlign:'center',
      paddingLeft : 10,
      paddingRight : 10
  },
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80
  },
});

export default LoginScreen;