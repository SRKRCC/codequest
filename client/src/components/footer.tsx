import { Linkedin, Instagram, User, Mail } from 'lucide-react';
import { FaYoutube, FaWhatsapp } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Footer = () => {

    return (
        <footer className="relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-chart-5 opacity-90"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-8 bg-white opacity-5 transform -skew-y-3"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Logo and description */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                SRKRCodingClub
                            </span>
                        </div>
                        <p className="text-muted-500 text-sm mt-4 max-w-md">
                            Empowering future developers through coding challenges, hackathons, and collaborative learning. Join our community to enhance your skills and connect with like-minded enthusiasts.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a
                                className="text-muted-500 hover:text-[#0077B5] transition-transform hover:scale-110 duration-300"
                                href="https://www.linkedin.com/in/srkr-coding-club-549799293?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-6 h-6" />
                            </a>
                            <a
                                className="text-muted-500 hover:text-pink-500 transition-transform hover:scale-110 duration-300"
                                href="https://www.instagram.com/srkr_coding_club?igsh=MWRoZGd5OHM0ZnZ4ZA=="
                                aria-label="Instagram"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a
                                className="text-muted-500 hover:text-green-600 transition-transform hover:scale-110 duration-300"
                                href="https://whatsapp.com/channel/0029VaAHYUQCnA7ph3c6mK3n"
                                aria-label="WhatsApp"
                            >
                                <FaWhatsapp className="w-6 h-6" />
                            </a>
                            <a
                                className="text-muted-500 hover:text-red-600 transition-transform hover:scale-110 duration-300"
                                href="https://youtube.com/@srkrcodingclub?si=97vLyVvdDeBopM17"
                                aria-label="YouTube"
                            >
                                <FaYoutube className="w-6 h-7" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Legal Links */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold text-muted-900 mb-6 border-b border-blue-500 pb-2 inline-block mt-2">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link 
                                    to="/privacy-policy" 
                                    className="text-muted-500 hover:text-primary transition-colors duration-300"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/terms-conditions" 
                                    className="text-muted-500 hover:text-primary transition-colors duration-300"
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="https://github.com/codevoid048/codequest" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-500 hover:text-primary transition-colors duration-300"
                                >
                                    Contribute
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Us */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold text-muted-900 mb-6 border-b border-blue-500 pb-2 inline-block mt-2">
                            Contact Us
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center group">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg text-white mr-3 group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className='font-medium text-sm'>David Kuppala</h4>
                                    <p className="text-muted-500 text-xs">+91 81217 02286</p>
                                </div>
                            </li>
                            <li className="flex items-center group">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg text-white mr-3 group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Ankith Pissay</h4>
                                    <p className="text-muted-500 text-xs">+91 91005 79797</p>
                                </div>
                            </li>
                            <li className="flex items-center group">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg text-white mr-3 group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="mt-0">
                                    <h4 className="font-medium text-sm">William Keri</h4>
                                    <p className="text-muted-500 text-xs">+91 99665 42463</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact section */}
                <div className="mt-12 border-t border-indigo-500 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Mail className="w-6 h-6 text-blue-500 mr-2" />
                            <span className="text-muted-500 text-sm">srkrcodingclubofficial@gmail.com</span>
                        </div>
                        <p className="text-muted-500 text-sm">
                            &copy; {new Date().getFullYear()} SRKRCodingClub. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;