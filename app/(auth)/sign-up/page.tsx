'use client';

import AuthForm from '@/components/AuthForm';
import React from 'react';
import { signUpSchema } from '@/lib/validations';
import { signUp } from '@/lib/actions/auth';

const page = () => (
    <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
        email:"",
        password:"",
        fullName: '',
        universityID: 0, 
        universityCard: '',
    }}
    onSubmit={signUp}
    />
);

export default page