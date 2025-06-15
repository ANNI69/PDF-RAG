"use client";
import { Check, Zap } from "lucide-react"
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
                        <span className="text-sm font-medium text-blue-700">Simple, transparent pricing</span>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Start for free and scale as you grow. No hidden fees, no surprises. Cancel anytime with just one click.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="relative border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                        <div className="relative">
                            <div className="text-center pb-8 pt-8 px-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Zap className="h-8 w-8 text-gray-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Free</h2>
                                <p className="text-gray-600 text-lg">Perfect for getting started</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        $0
                                    </span>
                                    <span className="text-gray-500 ml-2 text-lg">forever</span>
                                </div>
                            </div>
                            <div className="space-y-5 px-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">3 Credits per completion</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Basic support</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Community access</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Standard features</span>
                                </div>
                            </div>
                            <div className="pt-8 px-8 pb-8">
                                <button onClick={() => {
                                    router.push('/')
                                }
                                } className="w-full h-12 text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white text-gray-700">
                                    Get Started Free
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advance Plan */}
                    <div className="relative border-0 bg-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 text-sm font-semibold shadow-lg rounded-full">
                                Most Popular
                            </div>
                        </div>
                        <div className="relative">
                            <div className="text-center pb-8 pt-12 px-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Advance</h2>
                                <p className="text-gray-600 text-lg">For power users and professionals</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        $1.99
                                    </span>
                                    <span className="text-gray-500 ml-2 text-lg">/month</span>
                                </div>
                            </div>
                            <div className="space-y-5 px-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg font-medium">Unlimited Credits</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Priority support</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Advanced features</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">API access</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">Custom integrations</span>
                                </div>
                            </div>
                            <div className="pt-8 px-8 pb-8">
                                <button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white">
                                    Upgrade to Advance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-600 mb-12 text-lg">Everything you need to know about our pricing</p>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-1 gap-6 text-left">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-xl">What are credits?</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Credits are used for each completion or generation. Free users get 3 credits per completion, while
                                Advance users get unlimited credits to power through any project.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-xl">Can I cancel anytime?</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                You can cancel your subscription at any time with just one click. Your plan will remain active until the
                                end of your billing period, so you never lose what you have paid for.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-xl">Is there a free trial?</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Our Free plan is available forever with no time limit or credit card required. You can upgrade to
                                Advance whenever you need more credits and advanced features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
