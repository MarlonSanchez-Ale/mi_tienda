import sequelize from "@/database/config";
import { Sequelize } from "sequelize";
import User from "@/database/models/user";
import User_Profile from '@/database/models/user_profile'
const moment = require('moment');
const CryptoJS = require('crypto-js');
const { v4 } = require('uuid');

export default async function createUser(req, res) {
    try {

        if (req.method === 'POST') {
            const newUserTransaction = await sequelize.transaction();

            const { userName, name, email, phone, password, configpass  } = req.body;
            //Permite letras,no permite _ o . en el inicio ni al final , no permine _. y una longitud de 3 a 15
            const validausuario = /^(?=.{3,15}$)(?![_.])(?![0-9])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;

            
                    //La contraseña debe tener al entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.
                    //Puede tener otros símbolos.
            const passwordValid = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/

            //Realizando validaciones
            //Validando la llegada de un nombre de usuario
            if (!userName) {
                return res.status(402).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar el nombre de usuario'
                });
            }

            if (!name) {
                return res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar el nombre.'
                });
            }

            if (!email) {
                return res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar el correo.'
                });
            }

            if (!phone) {
                return res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar el número de celular.'
                });
            }

           /* if (!id_profile) {
                return res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar del perfil de usuario'
                });
            }
*/
            //Validacion de dato entrante
            if (!password) {
                res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar la contraseña.'
                });
                return;
            }
            // Validando confirmacion de password

            if (!configpass) {
                res.status(400).json({
                    title: 'Se ha detectado un error por falta de datos.',
                    message: 'Debe ingresar la confirmación de contraseña.',
                    status: 400
                });
                return;
            }
            //Validando si cumple con los parametros
            if (!validausuario.test(userName)) {
                res.status(400).json({
                    title: 'Usuario inválido. Asegurarse de cumplir la siguiente condición.',
                    message: 'Permite letras,no permite _ o . en el inicio ni al final , no permine _. y una longitud de 3 a 15'
                });
                return;
            }


            //Validando si existe un nombre de usuario igual

            const userNameExist = await User.findAll({
                where: {
                    user_name: userName,
                }
            });

            if (userNameExist.length > 0) {
                res.status(400).json({
                    title: 'Se ha detectado un error, dato inválido.',
                    message: 'El nombre de usuario ya existe en la base de datos.'
                });
                return;
            }

            //Validando que el password cumpla con la sintaxis que nosotros queremos, con ayuda de
            //expresiones regulares

            if (!passwordValid.test(password)) {
                res.status(400).json({
                    title: 'Se ha detectado un error por dato inválido.',
                    message: 'La contraseña debe tener al más de 5 caracteres, al menos un dígito, al menos una minúscula, al menos una mayúscula y al menos un caracter no alfanumérico.'
                });
                return;
            }



            // Validando que la contraseñas sean iguales

            if (password != configpass) {
                res.status(400).json({
                    title: 'Se ha detectado un error de dato inválido.',
                    message: 'Las contraseñas ingresadas deben ser iguales'
                });
                return;
            }

            const salt = CryptoJS["lib"].WordArray.random(128 / 8).toString();
            const hash = CryptoJS['PBKDF2'](password, salt, { keySize: 256 / 32, iterations: 1000 })
                .toString();

            const newUser = {
                user_create: 'ADMIN',
                user_update: 'ADMIN',
                date_create: moment().format('YYYY-MM-DD'),
                date_update: moment().format('YYYY-MM-DD'),
                id_users: v4(),
                user_name: userName,
                salt: salt,
                hash: hash,
                status: "ACTIVO",
                name: name,
                email: email,
                phone: phone
            };

         

           await User.create(newUser, {
                transaction: newUserTransaction
            });

           /* await User_Profile.create(newProfileUser, {
                transaction: newUserTransaction
            });*/

            await newUserTransaction.commit();

            return res.status(200).json({
                title: 'Operación exitosa',
                message: 'El usuario se ha creado correctamente.',
                newUser,
               // newProfileUser,
                status: 200
            });


        }

    } catch (error) {
        //await newUserTransaction.rollback()
        throw error;
    }
}