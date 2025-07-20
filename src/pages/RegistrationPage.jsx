import React, { useState, useEffect, useRef } from 'react'; // useCallback removed
import PropTypes from 'prop-types'; // Import PropTypes
import { supabase } from '../supabaseClient.js'; 

// Import the new Step3SelfieCapture component
import Step3SelfieCapture from '../components/Step3SelfieCapture.jsx'; 


// --- Helper function to convert base64 to File ---
// This function needs to stay here or be moved to a shared utils file
// because uploadImage uses it, and uploadImage is within RegistrationPage.
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
            <div className="mt-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                {errors?.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" maxLength="4" />
                    {errors?.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                    <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                    <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                     {errors?.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" maxLength="11" />
                    {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                <button onClick={onNext} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">Next</button>
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
        'PRC ID', 'UMID', 'SSS ID'
    ];
    
    const isPassport = idType === 'Passport';

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">ID Verification</h2>
            <div>
                <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select id="idType" name="idType" value={idType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    {idOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
            </div>
            <div className={`grid grid-cols-1 ${isPassport ? 'justify-items-center' : 'md:grid-cols-2'} gap-8 mt-6`}>
                <div className="text-center w-full max-w-sm">
                    <h3 className="font-semibold text-gray-600 mb-2 capitalize">{isPassport ? 'Passport Photo Page' : 'Front of ID'}</h3>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {idImages.front ? (
                            <img src={idImages.front} alt="Front of ID" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-500">Preview</span>
                        )}
                    </div>
                    {errors?.idFront && <p className="text-red-500 text-xs mt-1">{errors.idFront}</p>}
                </div>

                {!isPassport && (
                    <div className="text-center w-full max-w-sm">
                        <h3 className="font-semibold text-gray-600 mb-2 capitalize">Back of ID</h3>
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                            {idImages.back ? (
                                <img src={idImages.back} alt="Back of ID" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-500">Preview</span>
                            )}
                        </div>
                        {errors?.idBack && <p className="text-red-500 text-xs mt-1">{errors.idBack}</p>}
                    </div>
                )}
            </div>
            {errors?.id && <p className="text-red-500 text-sm mt-4 text-center">{errors.id}</p>}
            <div className="mt-6 text-center">
                   <button onClick={onScan} className="w-full md:w-1/2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-600 transition">
                     {isPassport ? 'Scan Passport' : 'Scan ID'}
                   </button>
             </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition">Back</button>
                <button onClick={onNext} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">Next</button>
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
    errors: PropTypes.object, // Added errors to propTypes
};

const Step4Confirmation = ({ formData, idImages, selfieImage, onConfirm, onBack, isLoading }) => {
    const detailItem = (label, value) => (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-medium text-gray-800">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Review Your Details</h2>
            <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {detailItem('First Name', formData.firstName)}
                        {detailItem('Middle Name', formData.middleName)}
                        {detailItem('Last Name', formData.lastName)}
                        {detailItem('Birthday', formData.birthday)}
                        {detailItem('Email', formData.email)}
                        {detailItem('Phone', formData.phone)}
                        <div className="sm:col-span-2">
                            {detailItem('Address', formData.address)}
                        </div>
                        {detailItem('Postal Code', formData.postalCode)}
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
                <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition" disabled={isLoading}>Back to Edit</button>
                <button onClick={onConfirm} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:bg-gray-400" disabled={isLoading}>
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
                    if (videoRef.current) {
                        videoRef.current.srcObject = streamRef.current;
                    }
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
                <button onClick={onClose} className="text-2xl">&times;</button>
                <h2 className="text-xl font-semibold mx-auto">Take photo</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
                <p className="absolute top-4 text-lg">
                    {captureStage === 'front' ? 'Front of ID' : 'Back of ID'}
                </p>
                <div className="relative w-full h-full flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full object-cover">
                        <track kind="captions" />
                    </video>
                    <div className="id-outline"></div>
                </div>
            </main>
            
            <footer className="text-center p-4 space-y-4">
                <p>Place your ID within the frame and take a picture</p>
                <button
                    onClick={handleCapture}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Capture photo"
                ></button>
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

const SubmissionMessage = () => (
    <div className="text-center py-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Registration Submitted!</h2>
        <p className="text-gray-600 mt-2">Thank you. Your information has been submitted for review.</p>
    </div>
);


const uploadImage = async (image, name, userId) => {
    if (!image) return null;
    const file = dataURLtoFile(image, `${name}.jpg`);
    const filePath = `${userId}/${name}-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, file);
    
    if (uploadError) {
        console.error(`Error uploading ${name}:`, uploadError);
        throw uploadError;
    }

    const { data: urlData } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath);
    
    return urlData.publicUrl;
};

const validatePersonalInfo = (formData) => {
    const errors = {};
    const { firstName, lastName, address, postalCode, birthday, email, phone, password, confirmPassword } = formData;

   
    if (!firstName) errors.firstName = 'First name is required.';
    if (!lastName) errors.lastName = 'Last name is required.';
    if (!address) errors.address = 'Address is required.';
    if (!postalCode) errors.postalCode = 'Postal Code is required.';
    if (!birthday) errors.birthday = 'Birthday is required.';
    if (!email) errors.email = 'Email is required.';
    if (!phone) errors.phone = 'Phone number is required.';
    if (!password) errors.password = 'Password is required.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm Password is required.';

 
    if (postalCode && postalCode.length !== 4) {
        errors.postalCode = 'Postal code must be 4 digits.';
    }

   
    if (phone) { 
        if (phone.length !== 11) {
            errors.phone = 'Phone number must be 11 digits.';
        } else if (!phone.startsWith('0')) {
            errors.phone = 'Phone number must start with 0.';
        }
    }
    
    // Password validation
    if (password) {
        if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        } else if (!/(?=.*[a-z])/.test(password)) {
            errors.password = 'Password must contain a lowercase letter.';
        } else if (!/(?=.*[A-Z])/.test(password)) {
            errors.password = 'Password must contain an uppercase letter.';
        } else if (!/(?=.*\d)/.test(password)) {
            errors.password = 'Password must contain a number.';
        } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
            errors.password = 'Password must contain a special character.';
        }
    }
    // Check password match only if both password fields are filled
    if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    // Birthday age validation
    if (birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 15) {
            errors.birthday = 'You must be at least 15 years old.';
        }
    }

    // If any field-specific errors exist and a required field is missing,
    // ensure a general form error is also shown if needed for UX.
    const requiredFields = ['firstName', 'lastName', 'address', 'postalCode', 'birthday', 'email', 'phone', 'password', 'confirmPassword'];
    const allRequiredFilled = requiredFields.every(field => formData[field]);
    if (!allRequiredFilled && Object.keys(errors).length === 0) { // Only add general if no specific errors yet
        errors.form = 'Please fill out all required fields.';
    } else if (!allRequiredFilled && Object.keys(errors).length > 0) {
        // If there are specific errors, just let them handle the feedback
        // Or you could concatenate a message like 'Please correct the errors above and fill all fields.'
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
    // General error if both specific ID parts are missing for non-passport
    if (Object.keys(errors).length > 0 && !errors.id) { // If there are errors for idFront/idBack
        errors.id = 'Please capture both images of your ID.';
    }
    return errors;
};


// --- Main Page Component ---

export default function RegistrationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        address: '', postalCode: '', birthday: '',
        email: '', phone: '', idType: 'National ID (Card Type)',
        password: '', confirmPassword: ''
    });
    const [idImages, setIdImages] = useState({ front: null, back: null });
    const [selfieImage, setSelfieImage] = useState(null);
    const [idCaptureStage, setIdCaptureStage] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'postalCode' || name === 'phone') {
            processedValue = value.replace(/\D/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        // Clear specific error for the field being changed
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        // Clear general form errors if fields are being filled
        if (errors.form) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.form;
                return newErrors;
            });
        }
    };
    
    // Refactored validateStep to use dedicated validation functions
    const validateStep = (step) => {
        let currentStepErrors = {};
        if (step === 1) {
            currentStepErrors = validatePersonalInfo(formData);
        } else if (step === 2) {
            currentStepErrors = validateIdVerification(formData, idImages);
        }
        // For step 3, we're relying on the Step3SelfieCapture component's internal logic
        // and a simple check for selfieImage existence before advancing from Step 3
        
        setErrors(currentStepErrors); // Set the errors for the current step
        return Object.keys(currentStepErrors).length === 0; // Return true if no errors
    };

    const goToStep = (step) => {
        if (step > currentStep) { // Only validate when going forward
            if (!validateStep(currentStep)) {
                return; // Stop if validation fails
            }
        }
        setErrors({}); // Clear errors when moving to a new step
        setCurrentStep(step);
    };

    const handleStartScan = () => {
        setIdImages({ front: null, back: null }); // Clear previous ID images
        setIdCaptureStage('front'); // Start ID capture process
    };

    const handleIdCapture = (image) => {
        setIdImages(prev => ({ ...prev, [idCaptureStage]: image }));
        
        if (idCaptureStage === 'front' && formData.idType !== 'Passport') {
            setIdCaptureStage('back'); // If not passport, capture back next
        } else {
            setIdCaptureStage(null); // Finish ID capture
        }
    };
    
    const handleReview = () => {
        // Basic check for selfie image presence
        if (!selfieImage) {
            alert("Please take a selfie first."); // Use a more sophisticated error display if possible
            return;
        }
        goToStep(4); // Proceed to confirmation step
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);

        if (!supabase?.auth) {
            alert("Supabase client is not configured correctly. Please check your API keys.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Sign up user with email and password
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });
            
            if (authError) throw authError;

            const user = authData.user;
            if (!user) throw new Error("User registration failed. No user object returned.");

            // 2. Upload images to Supabase Storage
            const [selfieUrl, idFrontUrl, idBackUrl] = await Promise.all([
                uploadImage(selfieImage, 'selfie', user.id),
                uploadImage(idImages.front, 'id-front', user.id),
                // Only upload id-back if it exists (for non-passport IDs)
                formData.idType !== 'Passport' ? uploadImage(idImages.back, 'id-back', user.id) : null,
            ]);

            // 3. Insert user profile data into your 'users' table
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: user.id, // Link to Supabase Auth user ID
                    email: formData.email,
                    first_name: formData.firstName,
                    middle_name: formData.middleName,
                    last_name: formData.lastName,
                    display_name: `${formData.firstName} ${formData.lastName}`.trim(),
                    address: formData.address,
                    postal_code: formData.postalCode, // Added postal code to insert
                    birthday: formData.birthday, // Added birthday to insert
                    phone_number: formData.phone,
                    id_type: formData.idType, // Added id type to insert
                    selfie_image_url: selfieUrl, // Changed to selfie_image_url for consistency
                    id_front_url: idFrontUrl,
                    id_back_url: idBackUrl,
                    status: 'pending_approval', // Initial status
                    role: 'user', // Default role
                    created_at: new Date().toISOString(), // Add a timestamp
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error("Error inserting profile data:", profileError);
                throw profileError;
            }

            setCurrentStep(5); // Advance to the submission success message

        } catch (error) {
            console.error("Registration Error:", error);
            alert(`An error occurred during registration: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PersonalInfo formData={formData} handleChange={handleChange} onNext={() => goToStep(2)} errors={errors} />;
            case 2:
                // Pass errors to Step2IDVerification as well
                return <Step2IDVerification idType={formData.idType} handleChange={handleChange} idImages={idImages} onScan={handleStartScan} onNext={() => goToStep(3)} onBack={() => goToStep(1)} errors={errors} />;
            case 3:
                // Use the imported Step3SelfieCapture component
                return <Step3SelfieCapture selfieImage={selfieImage} setSelfieImage={setSelfieImage} onSubmit={handleReview} onBack={() => goToStep(2)} />;
            case 4:
                return <Step4Confirmation formData={formData} idImages={idImages} selfieImage={selfieImage} onConfirm={handleFinalSubmit} onBack={() => goToStep(3)} isLoading={isLoading} />;
            case 5:
                return <SubmissionMessage />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
            {/* The main container for steps other than the full-screen selfie capture */}
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
            {/* Render the full-screen selfie capture directly when currentStep is 3 */}
            {currentStep === 3 && renderStep()}
            
            {/* CameraModal for ID capture */}
            <CameraModal 
                captureStage={idCaptureStage} 
                onClose={() => setIdCaptureStage(null)} 
                onCapture={handleIdCapture}
            />
        </div>
    );
}