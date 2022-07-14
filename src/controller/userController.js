/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');
const {
    isValidEmail,
    isValidName,
    isValidPhone,
    isValid,
    isValidPassword,
    isValidPincode
} = require('../validation/validator');

exports.createUser = async function (req, res) {
    try {
        const data = req.body;
        const { title } = req.body;

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ msg: 'Body should not be empty' });
        }

        if (!isValid(data.title))
            return res.status(400).send({
                status: false,
                msg: 'The Title Attributes should not be empty'
            });
        if (!(title === 'Mr' || title === 'Mrs' || title === 'Miss')) {
            return res
                .status(400)
                .send({ status: false, msg: 'Title Should be Mr , Mrs , Miss' });
        }

        if (!isValid(data.name))
            return res.status(400).send({
                status: false,
                msg: 'The name Attributes should not be empty'
            });
        if (!isValidName(data.name))
            return res
                .status(400)
                .send({ status: false, msg: 'Please Enter Valid Name' });

        if (!isValid(data.phone))
            return res.status(400).send({
                status: false,
                msg: 'The phone Attributes should not be empty'
            });
        if (!isValidPhone(data.phone))
            return res
                .status(400)
                .send({ status: false, msg: 'Please Enter Valid phone' });

        const checkuniquephone = await userModel.findOne({ phone: data.phone });
        if (checkuniquephone)
            return res.status(400).send({
                status: false,
                msg: 'This phone Already Exists please Use Another'
            });

        if (!isValid(data.email))
            return res.status(400).send({
                status: false,
                msg: 'The email Attributes should not be empty'
            });
        if (!isValidEmail(data.email))
            return res
                .status(400)
                .send({ status: false, msg: 'Please Enter Email in valid Format' });

        const checkuniqueemail = await userModel.findOne({ email: data.email });
        if (checkuniqueemail)
            return res.status(400).send({
                status: false,
                msg: 'This Email Id Already Exists please Use Another'
            });

        if (!isValid(data.password))
            return res.status(400).send({
                status: false,
                msg: 'The Password Attributes should not be empty'
            });

        if (!isValidPassword(data.password))
            return res.status(400).send({
                status: false,
                msg: 'Password is not valid- your password should be 8 to 15 digit long'
            });
        if (req.body.address) {
            if (!isValidName(req.body.address.city))
                return res
                    .status(400)
                    .send({ status: false, msg: 'Please Enter Valid city Name' });
            if (req.body.address.street !== undefined)
                if (!isValid(req.body.address.street))
                    return res.status(400).send({
                        status: false,
                        msg: 'The street Attributes should not be empty'
                    });

            if (req.body.address.pincode !== undefined) {
                if (!isValidPincode(req.body.address.pincode))
                    return res
                        .status(400)
                        .send({ status: false, msg: 'Please Enter Valid Pincode' });
            }
        }
        const savedData = await userModel.create(data);
        res.status(201).send({ status: true, msg: 'Success', data: savedData });
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};

//........................................................ User Login
exports.userLogin = async function (req, res) {
    const { password, email } = req.body
    //....................................................Empty Attributes Validation
    if (!isValid(email) || !isValid(password))
        return res
            .status(400)
            .send({ status: false, msg: 'Pls Provide  Email And Password both' });
    const user = await userModel.findOne({ email, password });
    if (!user)
        return res.status(401).send({
            status: false,
            msg: 'The email or Password you are using is wrong'
        });

    const token = jwt.sign(
        {
            userId: user._id.toString()
        },
        'functionup-radon',
        {
            expiresIn: '24h'
        }
    );

    res.status(200).send({ status: true, message: 'Success', token: token });
};


