// components/ArrowNodes.js
import { FaNodeJs, FaReact, FaDatabase, FaServer } from 'react-icons/fa';

const ArrowNodes = () => {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg--900 text-white">
            {/* Title and Description */}
            <div className="text-transparent font text-center mb-4">
                <h1 className="text-4xl text-transparent font-bold">The Power of <span className="text--500 text-transparent font">AI</span>. The <span className="text--500 text-transparent font">Care of Humans</span>.</h1>
                <p className="mt-4 text-transparent font">Empowering brands with AI's precision, enhanced by human insight, ensuring exceptional quality in every newsletter we publish.</p>
            </div>
            <div className='mb-16 text-transparent font text-center'>

            </div>

            {/* Arrow Container */}
            <div className="relative w-full flex justify-center items-center">
                {/* Arrow Line */}
                <div className="absolute w-3/4 h-12 ml-12 bg-gradient-to-r from-purple-500 to-orange-500 transform -rotate-[30deg]"></div>

                {/* Node 1 */}
                <div className="absolute left-36 bottom-0 transform rotate-45 flex flex-col items-center">
                    <div className="bg-gray-800 p-4 rounded-full">
                        <FaNodeJs size={40} className="text-green-500" />
                    </div>
                    <div className="text-center mt-2 transform -rotate-45">
                        <h3 className="text-lg font-bold">Expert Oversight</h3>
                        <p className="text-sm">We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience.</p>
                    </div>
                </div>

                {/* Node 2 */}
                <div className="absolute left-72 bottom-12 transform rotate-45 flex flex-col items-center">
                    <div className="bg-gray-800 p-4 rounded-full">
                        <FaReact size={40} className="text-blue-500" />
                    </div>
                    <div className="text-center mt-2 transform -rotate-45">
                        <h3 className="text-lg font-bold">Expert Oversight</h3>
                        <p className="text-sm">We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience.</p>
                    </div>
                </div>

                {/* Node 3 */}
                <div className="absolute left-48 bottom-32 transform rotate-45 flex flex-col items-center">
                    <div className="bg-gray-800 p-4 rounded-full">
                        <FaDatabase size={40} className="text-purple-500" />
                    </div>
                    {/* <div className="text-center mt-2 transform -rotate-45">
                        <h3 className="text-lg font-bold">Expert Oversight</h3>
                        <p className="text-sm">We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience.</p>
                    </div> */}
                </div>

                {/* Node 4 */}
                <div className="absolute left-64 bottom-48 transform rotate-45 flex flex-col items-center">
                    <div className="bg-gray-800 p-4 rounded-full">
                        <FaServer size={40} className="text-gray-500" />
                    </div>
                    {/* <div className="text-center mt-2 transform -rotate-45">
                        <h3 className="text-lg font-bold">Expert Oversight</h3>
                        <p className="text-sm">We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience.</p>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ArrowNodes;
