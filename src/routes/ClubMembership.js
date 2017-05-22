import React from 'react'
import ReactNative, {
    View,
    StyleSheet,
    Switch,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native'
import Form, { formMargin } from '../components/Form'
import { GlobalStyles, Fields, shippingMethodTitle, takenShippingOptionValue, bottomBarHeight, dateFormat } from '../global/constants'
import { trimCreditCardNumber, makeCreditCardNumber, getArrayOfShippingOptions } from '../global/functions'
import Totals from '../components/Totals'
import Button from '../components/Button'
import ModalPicker from '../components/ModalPicker'
import ModalDatePickerIOS from '../components/ModalDatePickerIOS'
import Moment from 'moment'
import Loader from '../components/Loader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { receiveMember, findMemberByEmail, requestBillingAddress, requestShippingAddress, updateMemberInfo } from '../store/member/actions'
import { popRoute, pushRoute } from "../redux/navigation";

import ZipField from '../components/fields/ZipField'
import EmailField from '../components/fields/EmailField'
import PhoneField from '../components/fields/PhoneField'
import TextField from '../components/fields/TextField'
import CreditCard from '../components/CreditCard'

import { validateText } from '../validate/validateText'
import { validateEmail } from '../validate/validateEmail'
import { validatePhone } from '../validate/validatePhone'
import { validateZipCode } from '../validate/validateZipCode'
import { validatePassword } from '../validate/validatePassword'
import {
    validateCreditCardNumber,
    validateCreditCardCVV,
    validateCreditCardMM,
    validateCreditCardYY
} from '../validate/validateCreditCard'

@connect(state => ({
    cart: state.cart,
    address: state.address,
    shippingInfo: state.shippingInfo,
    member: state.member,
    options: state.options
}), dispatch => bindActionCreators({
    requestBillingAddress,
    requestShippingAddress,
    popRoute,
    pushRoute,
    receiveMember,
    findMemberByEmail,
    updateMemberInfo
}, dispatch))
export default class ClubMembership extends React.Component {

    constructor(props) {
        super(props)

        const { member } = props
        const email = member.get(`bill_email`)
        const address1 = member.get(`bill_addr1`)
        const bill_postal = member.get(`bill_postal`)
        const bill_city = member.get(`bill_city`)
        const bill_state = member.get(`bill_state`)
        const bill_phone = member.get(`bill_phone`)

        const ship_addr1 = member.get('ship_addr1') 
        const ship_addr2 = member.get('ship_addr2') 
        const ship_city = member.get('ship_city') 
        const ship_state = member.get('ship_state') 
        const ship_postal = member.get('ship_postal') 
        const ship_phone = member.get('ship_phone')
        const ship_name = member.get('ship_name')

        this.clubs = [`Select Club`, `Club 1`, `Club 2`, `Club 3`]

        this.state = {
            isClubOrder: false,
            email: {value: email, error: false, title: 'Email', editing: email.length > 0}, 
            password: {value: '', error: false, title: 'Password', editing: false}, 
            confirmationPassword: {value: '', error: false, title: 'Confirmation Password', editing: false}, 
            address1: {value: address1, error: false, title: 'Billing Info Address', editing: address1.length > 0}, 
            billingZipCode: {value: bill_postal, error: false, title: 'Billing Info Zip Code', editing: bill_postal.length > 0}, 
            billingCity: {value: bill_city, error: false, title: 'Billing Info City', editing: bill_city.length > 0}, 
            billingState: {value: bill_state, error: false, title: 'Billing Info State', editing: bill_state.length > 0}, 
            billingPhone: {value: bill_phone, error: false, title: 'Billing Info Phone', editing: bill_phone.length > 0}, 
            shipTo: {value: ship_name, error: false, title: 'Ship To', editing: ship_name.length > 0}, 
            shippingAddress: {value: ship_addr1, error: false, title: 'Shipping Address', editing: ship_addr1.length > 0}, 
            shippingAddress2: {value: ship_addr2, error: false, title: 'Shipping Address 2', editing: ship_addr2.length > 0}, 
            shippingZipCode: {value: ship_postal, error: false, title: 'Shipping Info Zip Code', editing: ship_postal.length > 0}, 
            shippingCity: {value: ship_city, error: false, title: 'Shipping Info City', editing: ship_city.length > 0}, 
            shippingState: {value: ship_state, error: false, title: 'Shipping Info State', editing: ship_state.length > 0}, 
            shippingPhone: {value: ship_phone, error: false, title: 'Shipping Info Phone', editing: ship_phone.length > 0}, 
            instructions: {value: '', error: false, title: 'Special instructions', editing: false},  

            isGift: false,  

            cardNumber: {value: makeCreditCardNumber(member.get(`cc_num`)), error: false, title: 'Credit Card Number', editing: false}, 
            cardCVV: {value: '', error: false, title: 'Credit Card CVV', editing: false}, 
            cardMM: {value: member.get(`cc_exp_mo`), error: false, title: 'Credit Card Month', editing: false}, 
            cardYY: {value: member.get(`cc_exp_yr`), error: false, title: 'Credit Card Year', editing: false},  

            isClubPickerVisible: false, 
            selectedClubIndex: 0,
            isShippingPickerVisible: false,
            club_ship_meth_pref: member.get('club_ship_meth_pref'),
            isDateBirthPickerVisible: false, 
            dateBirth: undefined, 
            billingZipCodeIsLoading: false, 
            shippingZipCodeIsLoading: false, 
            isUseCardReader: false
        }
    }

    join = () => {
        const { popRoute, receiveMember } = this.props
        const { cardNumber, cardCVV, cardMM, cardYY, shipTo,
            email, billingZipCode, billingCity, billingState, address1, club_ship_meth_pref, shippingAddress, shippingAddress2, shippingPhone,
            billingPhone, shippingZipCode, shippingCity, shippingState
        } = this.state

        receiveMember({
            // cc_is_cardreader: isUseCardReader,
            cc_num: trimCreditCardNumber(cardNumber.value),
            // cc_cvv: cardCVV.value,
            cc_exp_mo: cardMM.value,
            cc_exp_yr: cardYY.value,
            bill_email: email.value,
            bill_addr1: address1.value,
            bill_postal: billingZipCode.value,
            bill_city: billingCity.value,
            bill_state: billingState.value,
            bill_phone: billingPhone.value,

            club_ship_meth_pref,
            ship_name: shipTo.value,
            ship_addr1: shippingAddress.value,
            ship_addr2: shippingAddress2.value,
            ship_city: shippingCity.value,
            ship_state: shippingState.value,
            ship_postal: shippingZipCode.value,
            ship_phone: shippingPhone.value
        })
        popRoute(true)
    }
    
    setValueForFields(nameField, valueField, error=false){
        if (nameField == "confirmationPassword") {
            const { password } = this.state;
            let confirmationPassword = this.state[nameField];
            if (password.editing && confirmationPassword.editing) {
                validatePassword(password.value, valueField)
            }
        }
        let field = {};
        field[nameField] = {
            value: valueField,
            error: error,
            title: this.state[nameField].title,
            editing: true
        };

        this.setState(field)
    }

    checkEditing(nameField) {
        return this.state[nameField].editing;
    }

    //password
    validatePassword(nameField) {
        const { confirmationPassword, password } = this.state;
        let error = validatePassword(password.value, confirmationPassword.value);
        let cPassword = this.state.confirmationPassword;
        cPassword['error'] = error;
        this.setState({
            confirmationPassword: cPassword
        });
        return error
    }
    //end password

    //email
    validateEmail(email = this.state.email.value) {
        let error = validateEmail(email);
        this.setValueForFields('email', email, error);
        return error;
    }

    findCustomerByEmail () {
        const { findMemberByEmail } = this.props;
        const { email } = this.state;
        if (!email.error) {
            findMemberByEmail(email)
        } else { this.validateEmail() }
    }

    imageLookupEmail(){
        return (
            <TouchableOpacity onPress={() => this.findCustomerByEmail()}>
                <Image
                    style={[Styles.image]}
                    source={require('../global/image/lookup.png')}
                />
            </TouchableOpacity>
        )
    }
    //end email

    //textFields
    validateTextField(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value, title = field.title;
            let error = validateText(value, title);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    // imageLookupName(){
    //     return (
    //         <TouchableOpacity onPress={() => console.log('name')}>
    //             <Image
    //                 style={[Styles.image]}
    //                 source={require('../global/image/lookup.png')}
    //             />
    //         </TouchableOpacity>
    //     )
    // }

    imageCopy() {
        return (
            <TouchableOpacity onPress={() => this.cloneAddress()}>
                <Image
                    style={[Styles.image]}
                    source={require('../global/image/copy.png')}
                />
            </TouchableOpacity>
        );
    }

    cloneAddress() {
        this.setState({
            shippingAddress: this.state.address1
        });
    }
    //end textFields

    //creditCard
    validateCreditCardNumber(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardNumber(value);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardCVV(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardCVV(value);
            this.setValueForFields(nameField, value, error);
            console.log(error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardMM(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardMM(value);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    validateCreditCardYY(nameField){
        try {
            let field = this.state[nameField];
            let value = field.value;
            let error = validateCreditCardYY(value);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }
    //end creditCard

    //phone
    validatePhone(nameField) {
        try {
            let field = this.state[nameField];
            let value = field.value, title = field.title;
            let error = validatePhone(value, title);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }
    //end phone

    //zipCode
    validateZipCode(nameField) {
        try {
            let field = this.state[nameField];
            let value = field.value, title = field.title;
            let error = validateZipCode(value, title);
            this.setValueForFields(nameField, value, error);
            return error;
        } catch (error) {
            console.log(error)
        }
    }

    //api zip code
    sendToBillingZipCode(zipCode) { 
        const { requestBillingAddress } = this.props; 
        this.setState({billingZipCodeIsLoading: true}) 
        requestBillingAddress(zipCode, (address) => { 
            this.setState({ 
                billingCity: {value: address ? address.city : ``, error: false, title: 'Billing Info City'}, 
                billingCountry: {value: address ? address.state : ``, error: false, title: 'Billing Info Country'}, 
                billingZipCodeIsLoading: false 
            }) 
        }) 
    }  

    sendToShippingZipCode(zipCode) { 
        const { requestShippingAddress } = this.props; 
        this.setState({shippingZipCodeIsLoading: true}) 
        requestShippingAddress(zipCode, (address) => { 
            this.setState({ 
                shippingCity: {value: address ? address.city : ``, error: false, title: 'Shipping Info City'}, 
                shippingCountry: {value: address ? address.state : ``, error: false, title: 'Shipping Info Country'}, 
                shippingZipCodeIsLoading: false 
            }) 
        }) 
    }
    //end api
    //end zipCode

    getShippingOptions(nameField) {
        const { options }  = this.props;
        try {
            return options.shippingOptions.get(this.getValueByNameOfMember(nameField))
        } catch (error) {
            console.log(error)
        }
    }

    scrollToInput(event, reactNode) {
        const node = ReactNative.findNodeHandle(reactNode)
        this.refs.scrollView.scrollToFocusedInput(event, node)
    }

    render() {
        const { cart, member, popRoute, options, updateMemberInfo } = this.props
        const {
            isClubOrder, 
            isClubPickerVisible, 
            selectedClubIndex,
            password,
            confirmationPassword,
            club_ship_meth_pref,
            isShippingPickerVisible, 
            dateBirth, 
            isDateBirthPickerVisible, 
            email, 
            address1,
            shipTo,
            instructions,

            billingZipCode, 
            billingCity, 
            billingState, 
            billingPhone,  

            shippingAddress, 
            shippingAddress2, 
            shippingZipCode, 
            shippingCity, 
            shippingState, 
            shippingPhone,  

            cardNumber, 
            cardCVV, 
            cardMM, 
            cardYY, 
            isUseCardReader,  

            billingZipCodeIsLoading, 
            shippingZipCodeIsLoading
        } = this.state
        const isTaken = club_ship_meth_pref === takenShippingOptionValue
        return (
            <View style={Styles.container}>
                <KeyboardAwareScrollView style={Styles.scrollView} ref='scrollView'>
                    <View style={Styles.topAndCenter}>
                        <Form style={Styles.topForm} title='Payment Info'>
                            <CreditCard
                                setValueForFields={this.setValueForFields.bind(this)}
                                validate={this.validateCreditCardNumber.bind(this)}
                                validateCVV={this.validateCreditCardCVV.bind(this)}
                                validateMM={this.validateCreditCardMM.bind(this)}
                                validateYY={this.validateCreditCardYY.bind(this)}
                                checkEditing={this.checkEditing.bind(this)}
                                nameFieldCard="cardNumber"
                                nameFieldCVV="cardCVV"
                                nameFieldMM="cardMM"
                                nameFieldYY="cardYY"
                                number={cardNumber.value}
                                cvv={cardCVV.value}
                                expiryMonth={cardMM.value}
                                expiryYear={cardYY.value}
                                isUseCardReader={isUseCardReader}
                            />
                        </Form>
                        <View style={Styles.center}>
                            <Form style={[Styles.leftForm, Styles.centerForm]} title='Billing Info'>
                                <View style={Styles.row}>
                                    <View style={Styles.checkBox}>
                                        <Switch onValueChange={(isClubOrder) => this.setState({isClubOrder})} value={isClubOrder} />
                                        <Text style={Styles.checkBoxTitle}>Make current order an order for this club</Text>
                                    </View>
                                </View>
                                <View style={Styles.row}>
                                    <EmailField
                                        placeholder="Enter email address here"
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validateEmail.bind(this)}
                                        button={this.imageLookupEmail()}
                                        value={email.value}
                                        nameField={'email'}
                                        checkEditing={this.checkEditing.bind(this)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Password'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validateTextField.bind(this)}
                                        nameField={'password'}
                                        value={password.value}
                                        checkEditing={this.checkEditing.bind(this)}
                                        secure={true}
                                        ref={ref => this.bill_passField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_passField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Password (again)'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validatePassword.bind(this)}
                                        nameField={'confirmationPassword'}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={confirmationPassword.value}
                                        secure={true}
                                        ref={ref => this.bill_pass_againField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_pass_againField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <TextField
                                        placeholder={'Address'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        validate={this.validateTextField.bind(this)}
                                        nameField={'address1'}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={address1.value}
                                        ref={ref => this.bill_addr1Field = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_addr1Field)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <ZipField
                                        sendToZipCode={this.sendToBillingZipCode.bind(this)}
                                        address={member.get('bill_postal') }
                                        validate={this.validateZipCode.bind(this)}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        nameField="billingZipCode"
                                        nameFieldCity="billingCity"
                                        nameFieldState="billingState"
                                        checkEditing={this.checkEditing.bind(this)}
                                        zipcode={billingZipCode.value}
                                        city={billingCity.value}
                                        state={billingState.value}
                                        isLoading={billingZipCodeIsLoading}
                                        ref={ref => this.bill_postalField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_postalField)}
                                    />
                                </View>
                                <View style={Styles.row}>
                                    <Button
                                        style={Styles.pickerButton}
                                        title={this.clubs[selectedClubIndex]}
                                        onPress={() => this.setState({isClubPickerVisible: true})}/>
                                </View>
                                <View style={Styles.row}>
                                    <PhoneField
                                        setPhone={this.setValueForFields.bind(this)}
                                        validate={this.validatePhone.bind(this)}
                                        nameField={'billingPhone'}
                                        setValueForFields={this.setValueForFields.bind(this)}
                                        checkEditing={this.checkEditing.bind(this)}
                                        value={billingPhone.value}
                                        ref={ref => this.bill_phoneField = ref}
                                        onFocus={(event) => this.scrollToInput(event, this.bill_phoneField)}
                                    />
                                </View>
                            </Form>
                            <Form style={[Styles.rightForm, Styles.centerForm]} title='Shipping Info'>
                                <View style={Styles.row}>
                                    {
                                        options.shippingOptions.get(member.get(Fields.club_ship_meth_pref)) == undefined ?
                                            <Loader /> :
                                            <Button
                                                style={Styles.pickerButton}
                                                title={`${shippingMethodTitle}: ${options.shippingOptions.get(club_ship_meth_pref)}`}
                                                onPress={() => this.setState({isShippingPickerVisible: true})}
                                            />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Ship To'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={this.validateTextField.bind(this)}
                                            nameField={'shipTo'}
                                            value={shipTo.value}
                                            checkEditing={this.checkEditing.bind(this)}
                                            ref={ref => this.ship_nameField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_nameField)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Shipping address 1'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={this.validateTextField.bind(this)}
                                            nameField={'shippingAddress'}
                                            checkEditing={this.checkEditing.bind(this)}
                                            button={this.imageCopy()}
                                            value={shippingAddress.value}
                                            ref={ref => this.ship_addr1Field = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_addr1Field)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Shipping address 2'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={this.validateTextField.bind(this)}
                                            nameField={'shippingAddress2'}
                                            checkEditing={this.checkEditing.bind(this)}
                                            value={shippingAddress2.value}
                                            ref={ref => this.ship_addr2Field = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_addr2Field)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <ZipField
                                            sendToZipCode={this.sendToShippingZipCode.bind(this)}
                                            address={member.get('ship_postal') }
                                            validate={this.validateZipCode.bind(this)}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            nameField="shippingZipCode"
                                            nameFieldCity="shippingCity"
                                            nameFieldState="shippingState"
                                            checkEditing={this.checkEditing.bind(this)}
                                            zipcode={shippingZipCode.value}
                                            city={shippingCity.value}
                                            state={shippingState.value}
                                            isLoading={shippingZipCodeIsLoading}
                                            ref={ref => this.ship_postalField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_postalField)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <PhoneField
                                            setPhone={this.setValueForFields.bind(this)}
                                            validate={this.validatePhone.bind(this)}
                                            nameField={'shippingPhone'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            checkEditing={this.checkEditing.bind(this)}
                                            value={shippingPhone.value}
                                            ref={ref => this.ship_phoneField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.ship_phoneField)}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <Button
                                            style={Styles.pickerButton}
                                            title={dateBirth ? Moment(dateBirth).format(dateFormat) : 'Select date of Birth'}
                                            onPress={() => this.setState({isDateBirthPickerVisible: true})}
                                        />
                                    }
                                </View>
                                <View style={Styles.row}>
                                    {!isTaken &&
                                        <TextField
                                            placeholder={'Special instructions'}
                                            setValueForFields={this.setValueForFields.bind(this)}
                                            validate={this.validateTextField.bind(this)}
                                            nameField={'instructions'}
                                            value={instructions.value}
                                            checkEditing={this.checkEditing.bind(this)}
                                            ref={ref => this.instructionsField = ref}
                                            onFocus={(event) => this.scrollToInput(event, this.instructionsField)}
                                        />
                                    }
                                </View>
                            </Form>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <View style={[GlobalStyles.bottom, Styles.bottom]}>
                    <Button title="Cancel" onPress={() => popRoute()} />
                    <Totals cart={cart} />
                    <Button title="Join" onPress={this.join} />
                </View>
                <ModalPicker
                    visible={isClubPickerVisible}
                    selectedValue={selectedClubIndex}
                    onValueChange={(selectedClubIndex) => this.setState({selectedClubIndex})}
                    items={this.clubs.map((club, i) => ({ value: i, label: club}))}
                    closeAction={() => this.setState({isClubPickerVisible: false})}
                />
                <ModalPicker
                    visible={isShippingPickerVisible}
                    selectedValue={club_ship_meth_pref}
                    onValueChange={(club_ship_meth_pref) => this.setState({club_ship_meth_pref})}
                    items={getArrayOfShippingOptions(options).map((shipping, i) => ({ value: shipping.value, label: shipping.title }))}
                    closeAction={() => this.setState({isShippingPickerVisible: false})}
                />
                <ModalDatePickerIOS
                    visible={isDateBirthPickerVisible}
                    date={dateBirth}
                    onDateChange={(dateBirth) => this.setState({dateBirth})}
                    closeAction={() => this.setState({isDateBirthPickerVisible: false})}
                />
            </View>
        )
    }

}

const columnOffcet = 8
const { width, height } = Dimensions.get('window')

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 20
    },
    scrollView: {
        flex: 1
    },
    topAndCenter: {
        width,
        height: height - bottomBarHeight - 20
    },
    image: {
        width: 40,
        height: 40,
        marginLeft: 5
    },
    topForm: {
        height: 100,
        marginBottom: 0
    },
    center: {
        flex: 1,
        flexDirection: 'row'
    },
    leftForm: {
        flex: 1,
        marginRight: formMargin/2
    },
    rightForm: {
        flex: 1,
        marginLeft: formMargin/2
    },
    centerForm: {
        paddingHorizontal: 32
    },
    row: {
        flex: 1,
        justifyContent: 'center'
    },
    rowDirection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkBox: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkBoxTitle: {
        marginLeft: 4
    },
    next: {
        marginTop: 12
    },
    pickerButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: columnOffcet
    },
    column: {
        flex: 1,
        alignSelf: 'center'
    },
    nextColumn: {
        marginLeft: columnOffcet
    },
    prePayText: {
        textAlign: 'center',
        marginLeft: columnOffcet
    },
    bottom: {
        paddingHorizontal: 16
    }
})
