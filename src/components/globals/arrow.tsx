import React from 'react';

export default function Arrow() {
    return (
        <div className="flex justify-center items-center max-w-5xl mt-4 h-screen">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-2">
                <div className="radial-gradient rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110">
                    <div className="p-6">
                        <div className="bg-primary rounded-full p-3 inline-block mb-4">
                            <RocketIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Rapid Growth</h3>
                        <p className="text-muted-foreground">Accelerate your business with our innovative solutions. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto molestiae eligendi amet praesentium ullam natus, excepturi, quidem facilis, placeat maxime optio. Pariatur nostrum culpa beatae esse hic voluptate. Officia, sed.</p>
                    </div>
                </div>
                <div className="radial-gradient rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110">
                    <div className="p-6">
                        <div className="bg-secondary rounded-full p-3 inline-block mb-4">
                            <BriefcaseIcon className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Efficiency</h3>
                        <p className="text-muted-foreground">Streamline your operations for maximum productivity. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nam ea nemo aut, dolore asperiores sit, reiciendis inventore laborum ex, et nos</p>
                    </div>
                </div>
                <div className="radial-gradient rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110">
                    <div className="p-6">
                        <div className="bg-muted rounded-full p-3 inline-block mb-4">
                            <SettingsIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Customization</h3>
                        <p className="text-muted-foreground">Tailor our solutions to fit your unique business needs. Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, molestias ducimus fugiat libero nemo assumenda consequuntur tempore autem ea asperiores? Et, nostrum commodi totam blanditiis libero id tempore voluptas facilis!</p>
                    </div>
                </div>
                <div className="radial-gradient rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110">
                    <div className="p-6">
                        <div className="bg-primary rounded-full p-3 inline-block mb-4">
                            <BarChartIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Insights</h3>
                        <p className="text-muted-foreground">Gain valuable data-driven insights to drive your success.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BarChartIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    )
}


function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}


function RocketIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    )
}


function SettingsIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}


function XIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
