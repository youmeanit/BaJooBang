import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestForm.css';
import Roominfo from './../../components/RequestForm/roominfo';
import CheckText from '../../components/RequestForm/checkText';
import WaterBox from '../../components/RequestForm/waterBox';
import MoldBox from '../../components/RequestForm/moldBox';
import LightSelect from '../../components/RequestForm/lightSelect';
import { ReactComponent as Water } from '../../components/images/water.svg';
import { ReactComponent as Sun } from '../../components/images/sun.svg';
import { ReactComponent as Mold } from '../../components/images/mold.svg';
import { ReactComponent as Sink1 } from '../../components/images/sink1.svg';
import { ReactComponent as Sink2 } from '../../components/images/sink2.svg';
import { ReactComponent as Shower } from '../../components/images/shower.svg';
import { ReactComponent as Plus1 } from '../../components/images/plus1.svg';
import { ReactComponent as Check } from '../../components/images/check(heavy).svg';

import image1 from './A-1-3.PNG';
import image2 from './A-1-4.PNG';
import image3 from './A-1-5.PNG';
import image4 from './A-2-1.PNG';

function RequestForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { house_id } = useParams();

    console.log("Location state:", location.state);

    const content = location.state ? location.state.content : '기본값';

    const [requests, setRequests] = useState([
        {
            title: '콘센트 위치 확인하고 사진으로 찍어주세요.',
            text: '거실 왼쪽 안에 있습니다.',
            images: [image1, image2]
        },
        {
            title: '방음 상태 확인해주세요.',
            text: '잘 됩니다.',
            images: [image3, image4]
        },
        {
            title: '창문 잠금장치 상태 확인해주세요.',
            text: '견고합니다.',
            images: [image1, image3]
        }
    ]);
    

    const [inputs, setInputs] = useState([{ plus_q: '' }]);
    const [price, setPrice] = useState('');
    const [date, setDate] = useState('');
    const [write, setWrite] = useState(false); // 요청인이 발품 요청서를 작성할 상태인지 아닌지를 저장
    const [apply, setApply] = useState(false); // 발품인이 신청했는지에 대한 상태
    const [complete, setComplete] = useState(false);
    const [contentEditableStates, setContentEditableStates] = useState(requests.map(request => ({ text: request.text })));
    const contentRefs = useRef([]);
    const imageBoxRefs = useRef([]);
    const fileInputs = useRef([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 상태

    const handleInputChange = (index, event) => {
        const newInputs = inputs.map((input, i) => i === index ? { plus_q: event.target.value } : input);
        setInputs(newInputs);
    };

    const handleContentEditableChange = (index, event) => {
        const newContentEditableStates = contentEditableStates.map((state, i) => i === index ? { text: event.target.textContent } : state);
        setContentEditableStates(newContentEditableStates);
    };

    const handleAddRequest = () => {
        setInputs([...inputs, { plus_q: '' }]);
    };

    const handleFileChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '50px'; // 이미지 정사각형 크기 조절
                img.style.height = '50px';
                img.style.cursor = 'pointer';
                img.onclick = () => setSelectedImage(img.src); // 이미지 클릭 시 모달 열기
                if (imageBoxRefs.current[index]) {
                    imageBoxRefs.current[index].appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const closeModal = () => {
        setSelectedImage(null);
        setIsModalOpen(false);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    async function RequestPost() {
        const formData = new FormData();

        // JSON 데이터를 FormData에 추가 (plus_list만 추가)
        formData.append('jsonData', JSON.stringify({ plus_list: inputs }));

        // 요청 사항과 이미지들을 FormData에 추가
        requests.forEach((input, index) => {
            formData.append(`requests[${index}][title]`, input.title);
            formData.append(`requests[${index}][text]`, contentEditableStates[index].text);

            const fileInput = fileInputs.current[index];
            if (fileInput && fileInput.files.length > 0) {
                Array.from(fileInput.files).forEach((file, fileIndex) => {
                    formData.append(`requests[${index}][files][${fileIndex}]`, file);
                });
            }
        });

        try {
            const response = await axios.post(`http://localhost:8000/request-form?house_id=${house_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Request success:', response.data);
            navigate('/domap');
        } catch (error) {
            console.error('Request failed:', error);
        }
    }

    const WaterState = {
        sink: { selected: 1, // 상, 중, 하 중 선택된 값 (1: 상, 2: 중, 3: 하)
        hotWaterTime1: '01분 30초', // 김이 모락모락 나기까지의 시간
        hotWaterTime2: '02분 15초' },
        basin: {
            selected: 1, // 상, 중, 하 중 선택된 값 (1: 상, 2: 중, 3: 하)
        hotWaterTime1: '01분 30초', // 김이 모락모락 나기까지의 시간
        hotWaterTime2: '02분 15초'
        },
        shower: {selected: 1, // 상, 중, 하 중 선택된 값 (1: 상, 2: 중, 3: 하)
        hotWaterTime1: '01분 30초', // 김이 모락모락 나기까지의 시간
        hotWaterTime2: '02분 15초'}
        
    };
    const savedLightSelectOption = "좋음"; // Example saved state
    const savedMoldStates = {
        livingRoom: { hasItem: true, noItem: false },
        bathroom: { hasItem: false, noItem: true },
        balcony: { hasItem: true, noItem: false },
        shoeRack: { hasItem: false, noItem: true },
        windowFrame: { hasItem: true, noItem: false },
    };

    useEffect(() => {
        const updatedRequests = requests.map((request, index) => ({
            ...request,
            text: complete ? contentEditableStates[index].text : '',
            images: complete && imageBoxRefs.current[index] ? Array.from(imageBoxRefs.current[index].children).map(img => img.src) : []
        }));
        setRequests(updatedRequests);
    }, [complete, contentEditableStates, requests]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '5vw', paddingBottom: '5vw', backgroundColor: '#ffffdd' }}>
            <div className='footWorkBG'>
                <div className='pageTitle'>
                    발품 요청서 작성
                </div>
                <p className='title2'>매물 정보</p>
                <div className='requestBox'>
                    {write ? 
                    <>
                        <Roominfo title={'매물 주소'} content={content} />
                        <Roominfo title={'발품 기간'} placeholder={'발품 기간을 입력해주세요.'} onChange={(e) => setDate(e.target.value)} />
                        <Roominfo title={'발품 가격'} placeholder={'발품 가격을 입력해주세요.'} onChange={(e) => setPrice(e.target.value)} />
                    </>
                        :
                    <>
                        <Roominfo title={'매물 주소'} content={'서울특별시 중구 필동'} />
                        <Roominfo title={'발품 기간'} content={'2024/05/26 ~ 2024/05/30'} />
                        <Roominfo title={'발품 가격'} content={'10,000원'} />
                    </>
                     }
                    
                </div>

                <div className='title2' style={{ marginTop: '5vw', marginBottom: '1.5vw' }}>
                    기본 요청 사항
                </div>

                <div className='requestBox'>
                    <div style={{ display: 'flex', marginLeft: '2.2%', alignItems: 'center', marginBottom: '1.5vw' }}>
                        <div style={{ display: 'flex' }}>
                            <Water />
                        </div>
                        <p style={{ display: 'flex', color: '#5F5F5F', fontSize: '21px' }}>수압 & 온수</p>
                    </div>
                    <CheckText title={'수압 체크'} content1={'가이드 사진을 토대로 비교하여 상 중 하 선택'} />
                    <CheckText
                        title={'온수 체크(온수 조절기를 가장 뜨거운 쪽으로 둔 상태에서 수행)'}
                        content1={'1. 자신의 체온보다 높은 온수가 나오기까지의 시간'}
                        content2={'2. 김이 모락모락 나기까지의 시간'}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <WaterBox Icon={Sink1} title={'싱크대'} complete={complete} savedState={WaterState.sink} />
                        <WaterBox Icon={Sink2} title={'세면대'} complete={complete} savedState={WaterState.basin} />
                        <WaterBox Icon={Shower} title={'샤워기'} complete={complete} savedState={WaterState.shower} />
                    </div>
                </div>

                <div className='requestBox'>
                    <div style={{ display: 'flex', marginLeft: '2.2%', alignItems: 'center', marginBottom: '1.5vw' }}>
                        <Sun />
                        <p style={{ color: '#5F5F5F', fontSize: '21px' }}>채광</p>
                    </div>
                    <LightSelect complete={complete} savedState={savedLightSelectOption} />
                </div>

                <div className='requestBox'>
                    <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '2.2%', alignItems: 'center', marginBottom: '1.5vw' }}>
                        <Mold />
                        <p style={{ color: '#5F5F5F', fontSize: '21px' }}>곰팡이</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <MoldBox title={'거실'} complete={complete} savedState={savedMoldStates.livingRoom} />
                        <MoldBox title={'화장실'} complete={complete} savedState={savedMoldStates.bathroom} />
                        <MoldBox title={'베란다'} complete={complete} savedState={savedMoldStates.balcony} />
                        <MoldBox title={'신발장'} complete={complete} savedState={savedMoldStates.shoeRack} />
                        <MoldBox title={'창틀'} complete={complete} savedState={savedMoldStates.windowFrame} />
                    </div>
                </div>

                <div className='title2' style={{ marginBottom: '1.5vw' }}>추가 요청 사항</div>

                <div className='requestBox' style={{ paddingTop: '3vw' }}>
                    {write ? (
                        <>
                            {inputs.map((request, index) => (
                                <div key={index} style={{
                                    width: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                }}>
                                    <div style={{
                                        display: 'flex', 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        marginBottom: '3px',
                                        width: '93%',
                                    }}>
                                        <p style={{fontSize: '18px', color: '#5F5F5F', paddingRight: '0.7vw'}}>Q</p>
                                        <input
                                            className='plusInput' 
                                            placeholder='추가 요청사항을 작성해주세요.' 
                                            onChange={e => handleInputChange(index, e)}
                                        />
                                    </div>
                                    <div className='requestLine' style={{width: '51vw', marginTop: '-10px', marginBottom: '4vw'}}/>
                                </div>
                            ))}
                            <div style={{width: '100%', height: '8vw', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div className='plusCircle' onClick={handleAddRequest}>
                                    <Plus1/>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {requests.map((input, index) => (
                                <div className='plusrequestBox' key={index}>
                                    <div>
                                        <div className='plusrequestTitle'>
                                            요청 사항
                                            <div style={{ width: '1.5px', height: '1.5vw', backgroundColor: '#5F5F5F', borderRadius: '1px', marginLeft: '1vw', marginRight: '1vw' }} />
                                            Q. {input.title}
                                        </div>
                                        <div
                                            className="plusrequestContent"
                                            contentEditable={!complete}
                                            placeholder="요청 사항을 작성해주세요."
                                            onInput={e => handleContentEditableChange(index, e)}
                                            ref={el => contentRefs.current[index] = el}
                                            suppressContentEditableWarning={true}
                                        >
                                            {complete ?  contentEditableStates[index].text : input.text}
                                        </div>
                                        <div className='plusrequestImageBox' ref={el => imageBoxRefs.current[index] = el}>
                                            {complete && input.images.map((src, imgIndex) => (
                                                <img 
                                                    key={imgIndex} 
                                                    src={src} 
                                                    style={{ width: '50px', height: '50px', cursor: 'pointer' }} 
                                                    onClick={() => setSelectedImage(src)} 
                                                />
                                            ))}
                                        </div>
                                        {!complete && (
                                            <>
                                                <button className='plusrequestFile' contentEditable="false" onClick={() => document.getElementById(`fileInput-${index}`).click()}>
                                                    파일 업로드
                                                </button>
                                                <input 
                                                    type="file" 
                                                    id={`fileInput-${index}`} 
                                                    ref={el => fileInputs.current[index] = el}
                                                    style={{ display: 'none' }} 
                                                    onChange={e => handleFileChange(index, e)}
                                                    accept="image/*"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    {
                        apply ? 
                        <div onClick={RequestPost} style={{ width: '9vw', height: '3.7vw', backgroundColor: '#E9EBEF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check />
                            <p style={{ fontSize: '1vw', color: '#5F5F5F', marginLeft: '0.3vw' }}>작성완료</p>
                        </div>
                         :
                        <div onClick={openModal} style={{ width: '9vw', height: '3.7vw', backgroundColor: '#E9EBEF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '1vw', color: '#5F5F5F', marginLeft: '0.3vw' }}>발품 신청하기</p>
                        </div>

                    }
                </div>

                {selectedImage && (
                    <div className='modal' onClick={closeModal}>
                        <span className='close' onClick={closeModal}>&times;</span>
                        <img className='modal-content' src={selectedImage} alt='Selected' />
                    </div>
                )}

                {isModalOpen && (
                    <div className='modal' onClick={closeModal}>
                        <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                            <span className='close' onClick={closeModal}>&times;</span>
                            <p style={{fontSize: '25px', fontWeight: '500'}}>발품 신청</p>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <input type='text' placeholder='신청 메시지를 입력하세요.  예) 홍길동 발품 신청합니다!' className='modal-input' />
                            <button onClick={() => { setApply(true); closeModal(); }} className='modal-button'>신청하기</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequestForm;
