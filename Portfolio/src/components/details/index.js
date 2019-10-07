import React, { Component, PureComponent } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  StyleSheet,
  Text,
  Modal,
  TouchableHighlight,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { RNCamera } from 'react-native-camera'; 

const iOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const BARCODE_DELAY_FRAME = isAndroid ? 8 : 15;
const apiURL = 'http://demo9336585.mockable.io/portfolios';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

type Props = {
  styles: any,
  visible: boolean,
  onBarcodeModalClose: () => {},
};

const PendingView = () => (
  <View
    style={{
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

class ScannerScreen extends Component<Props> {

  static defaultProps = {
    visible: false,
  };

	static navigationOptions = ({ navigation }) => {
     const { params = {} } = navigation.state;
	    return {
	      headerTitle: "Scanner",
        headerTitleStyle: {
              textAlign: 'center',
              flexGrow:1,
              alignSelf:'center',
        },
        headerLeft: (
          <TouchableOpacity
              underlayColor='#fff'
              onPress={() => {
                params && params.onSignOut && params.onSignOut()
              }}
        >
       <Text style ={styles.scanButtonText}>Logout</Text>
        </TouchableOpacity>
        ),
	      headerRight: (
	        <TouchableOpacity
		          underlayColor='#fff'
		          onPress={() => {
                params && params.onOpneScanner && params.onOpneScanner()
		          }}
		    >
			 <Text style ={styles.scanButtonText}>Scan</Text>
		    </TouchableOpacity>
	      ),
	    };
	};
	constructor(props) {
	  super();
	  this.state = {qrvalue: '',opneScanner: false, modalVisible: false, flashMode: false,barcodeScanned: false, 
    scanResult: [],productDetails: {}, isNetworkCallInitiated: false, isConnected: true};
    this.camera = null;
    this.barcodeCodes = {};
    this.onBarcodeRead = this.onBarcodeRead.bind(this);
	}

  componentDidMount () {
    this.props.navigation.setParams({ onOpneScanner: this.onOpneScanner, onSignOut: this.onSignOut });
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = isConnectedToInternet => {
     this.setState({ isConnected: isConnectedToInternet });
  };

	
  onSignOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  onOpneScanner = () => {
    this.setState({opneScanner: true});
    // this.getProductDetailsByBarcode();

  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE",
          marginLeft: "0%"
        }}
      />
    );
  };

  renderHeader = () => {
    return <Text style={{alignItems: 'center', justifyContent: 'center',textAlign: 'center', fontSize: 13, fontWeight: "bold", backgroundColor: 'gray', color: 'white'}} >{this.state.productDetails && this.state.productDetails.description ? 'Service History ' : ''} </Text>;
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

    if (this.state.opneScanner === false) {
      let barcodeTitle = '';
      let barcodeValue = '';
      let productNameTitle = '';
      let productNameValue = '';
      let productDescTitle = '';
      let productDescValue = '';
      if (this.state.scanResult && this.state.scanResult.length > 0 && this.state.productDetails && this.state.productDetails.name && this.state.productDetails.description) {
        barcodeTitle = 'Scanned Bar Code: ';
        barcodeValue = this.state.scanResult
        productNameTitle = 'Product Name: ';
        productNameValue = this.state.productDetails.name;
        productDescTitle = 'Product Description: ';
        productDescValue = this.state.productDetails.description
      }
      return(
        <View style={{flex: 1,}} >
          <Text style={styles.productText}><Text style={{ fontWeight: "bold" }}>{barcodeTitle} </Text> {barcodeValue} </Text>
          <Text style={styles.productText}><Text style={{ fontWeight: "bold" }}>{productNameTitle} </Text> {productNameValue}</Text>
          <Text style={styles.productText}><Text style={{ fontWeight: "bold" }}>{productDescTitle} </Text> {productDescValue}</Text>
          <Text style={styles.productText} />
          <FlatList style={{paddingTop: 10, paddingBottom: 100}}
            data={this.state.productDetails.usage_history}
            ItemSeparatorComponent = {this.renderSeparator}
            renderItem={({item}) => 
            (<View>
              <Text style={styles.item}><Text style={{ fontWeight: "bold" }}>Details: </Text>{item.details}</Text>
              <Text style={styles.item}><Text style={{ fontWeight: "bold" }}>Used By: </Text>{item.used_by}</Text>
              <Text style={styles.item}><Text style={{ fontWeight: "bold" }}>Feedback: </Text>{item.feedback}</Text>
              <Text style={styles.item}><Text style={{ fontWeight: "bold" }}>Date: </Text>{item.date}</Text>
            </View>)
           }
           keyExtractor={item => item.date}
           containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
           ListHeaderComponent={this.state.productDetails && this.state.productDetails.description ? this.renderHeader: ''}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          onBarCodeRead= {this.onBarcodeRead}
          defaultTouchToFocus
          flashMode={RNCamera && RNCamera.Constants && RNCamera.Constants.FlashMode.auto}
          mirrorImage={false}
        >
          {({ camera, status, recordAudioPermissionStatus }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => this.setState({opneScanner: false})} style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> CLOSE </Text>
                </TouchableOpacity>
              </View>
            );
          }}

        </RNCamera>
        <View style={styles.topLeftFrame} />
        <View style={styles.topRightFrame} />
        <View style={styles.bottomLeftFrame} />
        <View style={styles.bottomRightFrame} />
      </View>
    );
  }

  

  onBarcodeRead = (scanResult: any) => {
    if (scanResult.data != null) {
      if (!this.barcodeCodes[scanResult.data]) {
        this.barcodeCodes[scanResult.data] = 1;
      } else if (this.barcodeCodes[scanResult.data] < BARCODE_DELAY_FRAME) {
        /* barcode reading is really fast and make sure the one in center staying longer time enough */
        this.barcodeCodes[scanResult.data] += 1;
      } else if (this.state.opneScanner) {
        this.getProductDetailsByBarcode(scanResult.data);
      }
    }
  }

  getProductDetailsByBarcode = async(scanResult) => {
    if(this.state.isConnected){
      this.setState({isNetworkCallInitiated: true});
      try {
        let response = await fetch(apiURL,{
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
         }
        );
        let responseJson = await response.json();
        console.log(responseJson);
        this.setState({opneScanner: false, scanResult: scanResult, productDetails: responseJson, isNetworkCallInitiated: false});
      } catch (error) {
        const errorMsg = error && error.message ? error.message : 'Login request failed';
        console.log(errorMsg);
        this.setState({isNetworkCallInitiated: false});
        Alert.alert(errorMsg);
      }
    } else {
      console.log('No Internet Connection');
      this.setState({isNetworkCallInitiated: false});
      Alert.alert(errorMsg);
    }
    
  }

  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  }
  onBarcodeModalClose = () => {
    this.setModalVisible(false);
  }
	
	
}


const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  }, 
 heading: { 
    color: 'black', 
    fontSize: 24, 
    alignSelf: 'center', 
    padding: 10, 
    marginTop: 30 
  },
  simpleText: { 
    fontSize: 13, 
    padding: 2, 
    marginTop: 2
  }, 

  productText: { 
    fontSize: 13, 
    padding: 2, 
    marginTop: 2,
    flexDirection: 'row',
  }, 
 scanScreenButton:{
  	width: "50%",
    marginRight:35,
    marginLeft:35,
    marginTop:0,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'#00B9F1',
  },
  scanButtonText:{
      color:'#fff',
      textAlign:'center',
      paddingLeft : 10,
      paddingRight : 10
  },
  item: {
    padding: 5,
    fontSize: 15,
    height: 30,
  },
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80
  },
  topLeftFrame: {
    position: 'absolute',
    top: (192 * deviceWidth / 375) + (deviceHeight - 667 * deviceWidth / 375) / 2,
    start: (40 * deviceWidth / 375),
    height: (40 * deviceWidth / 375),
    width: (40 * deviceWidth / 375),
    borderTopWidth: (4 * deviceWidth / 375),
    borderStartWidth: (4 * deviceWidth / 375),
    borderColor: 'green',
  },
  topRightFrame: {
    position: 'absolute',
    top: (192 * deviceWidth / 375) + (deviceHeight - 667 * deviceWidth / 375) / 2,
    end: (40 * deviceWidth / 375),
    height: (40 * deviceWidth / 375),
    width: (40 * deviceWidth / 375),
    borderTopWidth: (4 * deviceWidth / 375),
    borderEndWidth: (4 * deviceWidth / 375),
    borderColor: 'green',
  },
  bottomLeftFrame: {
    position: 'absolute',
    bottom: (234 * deviceWidth / 375) + (deviceHeight - 667 * deviceWidth / 375) / 2,
    start: (40 * deviceWidth / 375),
    height: (40 * deviceWidth / 375),
    width: (40 * deviceWidth / 375),
    borderBottomWidth: (4 * deviceWidth / 375),
    borderStartWidth: (4 * deviceWidth / 375),
    borderColor: 'green',
  },
  bottomRightFrame: {
    position: 'absolute',
    bottom: (234 * deviceWidth / 375) + (deviceHeight - 667 * deviceWidth / 375) / 2,
    end: (40 * deviceWidth / 375),
    height: (40 * deviceWidth / 375),
    width: (40 * deviceWidth / 375),
    borderBottomWidth: (4 * deviceWidth / 375),
    borderEndWidth: (4 * deviceWidth / 375),
    borderColor: 'green',
  },
});

export default ScannerScreen;