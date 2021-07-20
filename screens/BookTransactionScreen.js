import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage:'',
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue =async()=>{
      db.collection('books').doc(this.state.scannedBookId).update({bookAvailability:false,})
      db.collection('students').doc(this.state.scannedStudentId).update({booksIssued:firebase.firestore.FieldValue.increment(1)})
      db.collection('transaction').add({
        'studentID': this.state.scannedStudentId,
        'bookID': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': 'issue',
      })
      this.setState({scannedStudentId:'', scannedBookId:''}) 
    }
    initiateBookReturn =async()=>{
      db.collection('books').doc(this.state.scannedBookId).update({bookAvailability:true,})
      db.collection('students').doc(this.state.scannedStudentId).update({booksIssued:firebase.firestore.FieldValue.increment(-1)})
      db.collection('transaction').add({
        'studentID': this.state.scannedStudentId,
        'bookID': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': 'return',
      })
      this.setState({scannedStudentId:'', scannedBookId:''})
    }

    handleTransaction =()=>{
      var transactionMessage=null;
      db.collection('books').doc(this.state.scannedBookId).get()
      .then((doc)=>{
        var book = doc.data()
        if(book.bookAvailability){
          alert('heeeeee')
          this.initiateBookIssue();
          transactionMessage='book is issued';
          ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
        }
        else{
          alert('noooooo')
          this.initiateBookReturn();
          transactionMessage='book is returned'
          ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
        }
      }  
      )
      this.setState({transactionMessage:transactionMessage})
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView 
            style={styles.container} 
            behavior='padding'
            enabled
            >
            <View>
               <Text>{this.state.scannedBookId}</Text> 
               <Text>{this.state.scannedStudentId}</Text> 
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wireless Library</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}
              />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}
             />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
              <Text>{this.state.transactionMessage}</Text>
              <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                  var message = await this.handleTransaction;
                  this.setState({scannedBookId:'',scannedStudentId:''})}    
            }><Text style={styles.submitText}>SUBMIT</Text></TouchableOpacity>

          </KeyboardAvoidingView>

        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      alignSelf:'center',
      backgroundColor:'red',
      width:200,
      height:60,
    },
    submitText:{
      fontSize:30,
      alignSelf:'center',
      paddingTop:10,
    }
  });