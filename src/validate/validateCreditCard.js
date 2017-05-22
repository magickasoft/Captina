/**
 * Created by vladislav on 19/07/16.
 */

export const validators = {
    numbers: /\d+/g,
    characters: /\[A-Za-z]/g,
    cards: {
        visa: "^4[0-9]{12}(?:[0-9]{3})?$",
        amex: "^3[47][0-9]{13}$",
        mastercard: "^5[1-5][0-9]{14}$"
    }
}

export function validateCreditCardNumber(cardNumber) {
    cardNumber = cardNumber.split('-').join('');

    if (!cardNumber) {
        return 'Field Credit Card Number cannot be empty'
    }

    let flag = false;
    // let card = {};
    for (let card in validators.cards){
        if (!validators.cards.hasOwnProperty(card)) {
            continue
        }
        if (new RegExp(validators.cards[card], "g").test(cardNumber)) {
            flag = true;
        }

    }

    if (!flag) {
        return "Enter number card: Visa, MasterCard or American Express ";
    }

    return false
}

export function validateCreditCardCVV(cvv) {
    if (!cvv) {
        return 'Field Credit Card CVV code cannot be empty'
    }

    return false;
}

export function validateCreditCardMM(mm) {
    if (!mm) {
        return 'Field Year on Credit Card cannot be empty'
    }

    try {
        if (1 < mm && mm > 12){
            return "Invalid, data must be a number."
        }
    } catch (error) {

    }

    return false;
}

export function validateCreditCardYY(yy) {
    if (!yy) {
        return 'Field Month on Credit Card cannot be empty'
    }

    return false;
}