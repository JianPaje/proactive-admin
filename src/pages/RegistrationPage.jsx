import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types'; 
// NOTE: useNavigate is removed as we are not navigating within the web app on success
import { supabase } from '../supabaseClient.js'; 

import Step3SelfieCapture from '../components/Step3SelfieCapture.jsx'; 


// --- Helper function to convert base64 to File ---
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};


// --- Child Components ---

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-lg font-semibold text-gray-700">
            {currentTime.toLocaleTimeString()}
        </div>
    );
};

const StepIndicator = ({ currentStep }) => {
    const isConfirmationOrSubmission = currentStep >= 4;
    
    const getStepClass = (step) => {
        if (currentStep === step) return 'active';
        if (currentStep > step || isConfirmationOrSubmission) return 'completed';
        return 'border-gray-300';
    };

    return (
        <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-10">
            {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                    <div
                        className={`step-indicator flex items-center justify-center w-10 h-10 md:w-12 md:h-12 border-2 ${getStepClass(step)} rounded-full font-bold text-lg`}
                    >
                        {step}
                    </div>
                    {index < 2 && <div className="flex-1 h-1 bg-gray-200"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

StepIndicator.propTypes = {
    currentStep: PropTypes.number.isRequired,
};

const Step1PersonalInfo = ({ formData, handleChange, onNext, errors }) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['firstName', 'middleName', 'lastName'].map(field => {
                    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                        <div key={field}>
                            <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input type="text" id={field} name={field} value={formData[field]} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                            {errors?.[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <input type="text" id="business_address" name="business_address" value={formData.business_address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                {errors?.business_address && <p className="text-red-500 text-xs mt-1">{errors.business_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" maxLength="4" />
                    {errors?.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    {errors?.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" maxLength="11" />
                    {errors?.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            {errors?.form && <p className="text-red-500 text-sm mt-4 text-center">{errors.form}</p>}
            <div className="mt-8 text-right">
                <button type="button" onClick={onNext} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">Next</button>
            </div>
        </div>
    );
};

Step1PersonalInfo.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

const Step2IDVerification = ({ idType, handleChange, idImages, onScan, onNext, onBack, errors }) => {
    const idOptions = [
        'National ID (Card Type)', 'National ID (Paper Type) / Digital National ID', 'Passport',
        'HDMF (Pag-Ibig Loyalty Plus)', "Driver's License", 'Philippine Postal ID',
        'PRC ID', 'UMID', 'SSS ID' , 'School ID'
    ];
    
    const isPassport = idType === 'Passport';

    const getScanButtonText = () => {
        if (isPassport) return 'Scan Passport';
        if (idImages.front && idImages.back) return 'Rescan ID';
        return 'Scan ID';
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">ID Verification</h2>
            <div>
                <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select id="idType" name="idType" value={idType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    {idOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
            </div>
            <div className={`grid grid-cols-1 ${isPassport ? '' : 'md:grid-cols-2'} gap-8 mt-6 justify-items-center`}>
                <div className="text-center w-full max-w-sm">
                    <h3 className="font-semibold text-gray-600 mb-2 capitalize">{isPassport ? 'Passport Photo Page' : 'Front of ID'}</h3>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {idImages.front ? <img src={idImages.front} alt="Front of ID" className="w-full h-full object-cover" /> : <span className="text-gray-500">Preview</span>}
                    </div>
                    {errors?.idFront && <p className="text-red-500 text-xs mt-1">{errors.idFront}</p>}
                </div>

                {!isPassport && (
                    <div className="text-center w-full max-w-sm">
                        <h3 className="font-semibold text-gray-600 mb-2 capitalize">Back of ID</h3>
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                            {idImages.back ? <img src={idImages.back} alt="Back of ID" className="w-full h-full object-cover" /> : <span className="text-gray-500">Preview</span>}
                        </div>
                        {errors?.idBack && <p className="text-red-500 text-xs mt-1">{errors.idBack}</p>}
                    </div>
                )}
            </div>
            
            <div className="mt-6 text-center">
                <button type="button" onClick={onScan} className="w-full md:w-1/2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-600 transition">
                    {getScanButtonText()}
                </button>
            </div>

            {errors?.id && <p className="text-red-500 text-sm mt-4 text-center">{errors.id}</p>}
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button type="button" onClick={onBack} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition">Back</button>
                <button type="button" onClick={onNext} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">Next</button>
            </div>
        </div>
    );
};

Step2IDVerification.propTypes = {
    idType: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    idImages: PropTypes.object.isRequired,
    onScan: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

const Step4Confirmation = ({ formData, idImages, selfieImage, onConfirm, onBack, isLoading }) => {
    const detailItem = (label, value) => (
        <div className="py-2">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-medium text-gray-800 break-words">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Review Your Details</h2>
            <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
                        {detailItem('First Name', formData.firstName)}
                        {detailItem('Middle Name', formData.middleName)}
                        {detailItem('Last Name', formData.lastName)}
                        {detailItem('Username', formData.username)}
                        {detailItem('Date of Birth', formData.date_of_birth)}
                        {detailItem('Gender', formData.gender)}
                        <div className="sm:col-span-2 md:col-span-3">
                            {detailItem('Business Address', formData.business_address)}
                        </div>
                        {detailItem('Postal Code', formData.postalCode)}
                        {detailItem('Email', formData.email)}
                        {detailItem('Phone Number', formData.phone_number)}
                    </div>
                </div>

                <div className="p-4 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Verification Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="text-center">
                            <h4 className="font-semibold text-gray-600 mb-2">Selfie</h4>
                            <img src={selfieImage} alt="Selfie" className="w-full max-w-xs mx-auto h-auto rounded-lg shadow-md" />
                        </div>
                        <div className="text-center">
                            <h4 className="font-semibold text-gray-600 mb-2">{formData.idType === 'Passport' ? 'Passport' : 'ID Front'}</h4>
                            <img src={idImages.front} alt="ID Front" className="w-full max-w-xs mx-auto h-auto rounded-lg shadow-md" />
                        </div>
                        {idImages.back && (
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-600 mb-2">ID Back</h4>
                                <img src={idImages.back} alt="ID Back" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button type="button" onClick={onBack} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition" disabled={isLoading}>Back to Edit</button>
                <button type="button" onClick={onConfirm} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:bg-gray-400" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Confirm & Submit'}
                </button>
            </div>
        </div>
    );
};

Step4Confirmation.propTypes = {
    formData: PropTypes.object.isRequired,
    idImages: PropTypes.object.isRequired,
    selfieImage: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
};


const CameraModal = ({ captureStage, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const isOpen = !!captureStage;

    useEffect(() => {
        if (isOpen) {
            const startCamera = async () => {
                try {
                    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    onClose();
                }
            };
            startCamera();
        } else {
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [isOpen, onClose]);

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        onCapture(canvas.toDataURL('image/jpeg'));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col text-white">
            <header className="bg-gray-900 p-4 flex items-center">
                <button type="button" onClick={onClose} className="text-2xl">&times;</button>
                <h2 className="text-xl font-semibold mx-auto">Take photo</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
                <p className="absolute top-4 text-lg capitalize">{captureStage === 'front' ? 'Front of ID' : 'Back of ID'}</p>
                <div className="relative w-full h-full flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full object-cover"><track kind="captions" /></video>
                    <div className="id-outline"></div>
                </div>
            </main>
            
            <footer className="text-center p-4 space-y-4">
                <p>Place your ID within the frame and take a picture</p>
                <button type="button" onClick={handleCapture} className="w-16 h-16 bg-white rounded-full border-4 border-gray-400 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Capture photo"></button>
                <p className="text-gray-400 text-sm">Powered by ZOLOZ</p>
            </footer>
        </div>
    );
};

CameraModal.propTypes = {
    captureStage: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onCapture: PropTypes.func.isRequired,
};

const Step5VerificationResult = ({ result, onRetry }) => {
    // UPDATED: Automatically redirect on success to the mobile app
    useEffect(() => {
        if (result?.match) {
            const timer = setTimeout(() => {
                // This is a deep link that should open your React Native app
                window.location.href = 'retroapp://login'; 
            }, 3000); // 3-second delay

            return () => clearTimeout(timer);
        }
    }, [result]);

    if (!result) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
                <p className="text-gray-600 mt-2">Please wait while we check your details.</p>
            </div>
        );
    }

    if (result.match) {
        return (
            <div className="text-center py-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Registration Submitted!</h2>
                <p className="text-gray-600 mt-2">Thank you. Your information has been submitted for final review.</p>
                <p className="text-gray-600 mt-4 font-semibold">Attempting to open your mobile app to sign in...</p>
                <p className="text-gray-500 mt-2 text-sm">If the app does not open automatically, please open it manually and sign in.</p>
            </div>
        );
    } else {
        return (
            <div className="text-center py-10">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                <p className="text-gray-600 mt-2 mb-6">{result.details || "Your ID and selfie did not match. Please ensure your photos are clear and well-lit."}</p>
                <button type="button" onClick={onRetry} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                    Try Again
                </button>
            </div>
        );
    }
};

Step5VerificationResult.propTypes = {
    result: PropTypes.object,
    onRetry: PropTypes.func.isRequired,
};


const uploadImage = async (image, name, userId) => {
    if (!image) return null;
    const file = dataURLtoFile(image, `${name}.jpg`);
    const filePath = `${userId}/${name}-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage.from('admin').upload(filePath, file);
    
    if (uploadError) {
        console.error(`Error uploading ${name}:`, uploadError);
        throw uploadError;
    }

    const { data: urlData } = supabase.storage.from('admin').getPublicUrl(filePath);
    return urlData.publicUrl;
};

// --- Validation Logic ---
const validatePasswordComplexity = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter.';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter.';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain a number.';
    if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Password must contain a special character.';
    return null;
};

const validateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Date of birth is required.';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 15) return 'You must be at least 15 years old.';
    return null;
};

const validatePersonalInfo = (formData) => {
    const errors = {};
    const requiredFields = ['firstName', 'lastName', 'username', 'date_of_birth', 'business_address', 'postalCode', 'gender', 'email', 'phone_number', 'password', 'confirmPassword'];
    requiredFields.forEach(field => {
        if (!formData[field]) {
            const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            errors[field] = `${fieldName} is required.`;
        }
    });

    if (formData.username && formData.username.length < 3) errors.username = 'Username must be at least 3 characters.';
    if (formData.postalCode && formData.postalCode.length !== 4) errors.postalCode = 'Postal code must be 4 digits.';
    if (formData.phone_number) {
        if (formData.phone_number.length !== 11) errors.phone_number = 'Phone number must be 11 digits.';
        else if (!formData.phone_number.startsWith('0')) errors.phone_number = 'Phone number must start with 0.';
    }
    if (formData.password) {
        const passwordError = validatePasswordComplexity(formData.password);
        if (passwordError) errors.password = passwordError;
        else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    }
    const ageError = validateAge(formData.date_of_birth);
    if (ageError) errors.date_of_birth = ageError;

    if (requiredFields.every(field => formData[field]) && Object.keys(errors).length === 0) {
        delete errors.form;
    } else if (Object.keys(errors).length === 0) {
        errors.form = 'Please fill out all required fields.';
    }
    return errors;
};

const validateIdVerification = (formData, idImages) => {
    const errors = {};
    if (formData.idType === 'Passport') {
        if (!idImages.front) errors.id = 'Please capture an image of your passport.';
    } else {
        if (!idImages.front) errors.idFront = 'Please capture the front image of your ID.';
        if (!idImages.back) errors.idBack = 'Please capture the back image of your ID.';
    }
    if (Object.keys(errors).length > 0 && !errors.id) {
        errors.id = 'Please capture both images of your ID.';
    }
    return errors;
};


// --- Main Page Component ---
export default function RegistrationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const initialFormData = {
        firstName: '', middleName: '', lastName: '',
        username: '',
        business_address: '', postalCode: '', date_of_birth: '',
        gender: '', email: '', phone_number: '', 
        idType: 'National ID (Card Type)',
        password: '', confirmPassword: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [idImages, setIdImages] = useState({ front: null, back: null });
    const [selfieImage, setSelfieImage] = useState(null);
    const [idCaptureStage, setIdCaptureStage] = useState(null);
    const [errors, setErrors] = useState({});
    const [verificationResult, setVerificationResult] = useState(null);
    const idScanTimer = useRef(null);

    const handleRetryVerification = () => {
        setIdImages({ front: null, back: null });
        setSelfieImage(null);
        setVerificationResult(null);
        setCurrentStep(2);
    };

    useEffect(() => {
        return () => { if (idScanTimer.current) clearTimeout(idScanTimer.current); };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === 'postalCode' || name === 'phone_number') processedValue = value.replace(/\D/g, '');
        if (name === 'username') processedValue = value.replace(/\s/g, '');
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        if (errors[name] || errors.form) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                delete newErrors.form;
                return newErrors;
            });
        }
    };
    
    const validateStep = (step) => {
        let currentStepErrors = {};
        if (step === 1) currentStepErrors = validatePersonalInfo(formData);
        else if (step === 2) currentStepErrors = validateIdVerification(formData, idImages);
        setErrors(currentStepErrors);
        return Object.keys(currentStepErrors).length === 0;
    };

    const goToStep = (step) => {
        if (step > currentStep && !validateStep(currentStep)) return;
        setErrors({});
        setCurrentStep(step);
    };

    const handleStartScan = () => {
        if (idScanTimer.current) clearTimeout(idScanTimer.current);
        setIdImages({ front: null, back: null });
        setIdCaptureStage('front');
    };

    const handleIdCapture = (image) => {
        setIdImages(prev => ({ ...prev, [idCaptureStage]: image }));
        if (idCaptureStage === 'front' && formData.idType !== 'Passport') {
            setIdCaptureStage(null); 
            idScanTimer.current = setTimeout(() => setIdCaptureStage('back'), 3000);
        } else {
            setIdCaptureStage(null);
        }
    };
    
    const handleReview = () => {
        if (!selfieImage) {
            alert("Please take a selfie first.");
            return;
        }
        
        if (selfieImage === idImages.front) {
            alert("The selfie image cannot be the same as the ID photo. Please upload a valid ID document and take a new selfie.");
            return;
        }

        goToStep(4);
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        setVerificationResult(null);

        try {
            const tempUserId = `temp-${Date.now()}`;
            const [selfieUrl, idFrontUrl, idBackUrl] = await Promise.all([
                uploadImage(selfieImage, 'selfie', tempUserId),
                uploadImage(idImages.front, 'id-front', tempUserId),
                formData.idType !== 'Passport' ? uploadImage(idImages.back, 'id-back', tempUserId) : null,
            ]);
            
            if (!selfieUrl || !idFrontUrl) {
                throw new Error("One or more images failed to upload. Cannot proceed with face verification.");
            }

            console.log("Invoking face verification function...");
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-face', {
                body: {
                    selfieImageUrl: selfieUrl,
                    idFrontUrl: idFrontUrl,
                    userId: tempUserId,
                    userData: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        date_of_birth: formData.date_of_birth,
                        gender: formData.gender
                    },
                    idType: formData.idType
                },
            });

            if (verificationError) {
                throw new Error(verificationError.message);
            }
            
            setVerificationResult(verificationData);

            if (verificationData?.match) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });
                
                if (authError) throw authError;

                const user = authData.user;
                if (!user) throw new Error("User registration failed after verification.");

                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: formData.email,
                        username: formData.username,
                        first_name: formData.firstName,
                        middle_name: formData.middleName,
                        last_name: formData.lastName,
                        fullName: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.replace(/\s+/g, ' ').trim(),
                        business_address: formData.business_address,
                        postal_code: formData.postalCode,
                        date_of_birth: formData.date_of_birth,
                        gender: formData.gender,
                        phone_number: formData.phone_number,
                        id_type: formData.idType,
                        selfie_image_url: selfieUrl,
                        id_front_url: idFrontUrl,
                        id_back_url: idBackUrl,
                        status: 'pending_approval',
                        role: 'user',
                        is_face_verified: true,
                        face_match_score: verificationData.similarity,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) throw profileError;
            }
            
            setCurrentStep(5);

        } catch (error) {
            console.error("Registration Error:", error);
            alert(`An error occurred during registration: ${error.message}`);
            setVerificationResult({ match: false, details: error.message });
            setCurrentStep(5);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PersonalInfo formData={formData} handleChange={handleChange} onNext={() => goToStep(2)} errors={errors} />;
            case 2:
                return <Step2IDVerification idType={formData.idType} handleChange={handleChange} idImages={idImages} onScan={handleStartScan} onNext={() => goToStep(3)} onBack={() => goToStep(1)} errors={errors} />;
            case 3:
                return <Step3SelfieCapture selfieImage={selfieImage} setSelfieImage={setSelfieImage} onSubmit={handleReview} onBack={() => goToStep(2)} />;
            case 4:
                return <Step4Confirmation formData={formData} idImages={idImages} selfieImage={selfieImage} onConfirm={handleFinalSubmit} onBack={() => goToStep(3)} isLoading={isLoading} />;
            case 5:
                return <Step5VerificationResult result={verificationResult} onRetry={handleRetryVerification} onSuccessRedirect={() => { /* Handled by useEffect in Step5 */ }} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
            {currentStep !== 3 && (
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-10 relative">
                    {currentStep < 5 && (
                        <div className="absolute top-4 right-4 md:top-6 md:right-6">
                            <Clock />
                        </div>
                    )}
                    {currentStep < 5 && (
                        <>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4 pt-8 md:pt-0">
                                {currentStep === 4 ? 'Review Your Details' : 'Registration & Verification'}
                            </h1>
                            <p className="text-center text-gray-500 mb-8 px-2">
                               {currentStep === 4 ? 'Please confirm that the following information is correct.' : 'Please complete all steps to finish your registration.'}
                            </p>
                            <StepIndicator currentStep={currentStep} />
                        </>
                    )}
                    {renderStep()}
                </div>
            )}
            {currentStep === 3 && renderStep()}
            
            <CameraModal 
                captureStage={idCaptureStage} 
                onClose={() => setIdCaptureStage(null)} 
                onCapture={handleIdCapture}
            />
        </div>
    );
}
