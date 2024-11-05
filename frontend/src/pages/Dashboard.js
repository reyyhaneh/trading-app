import React, {useState} from 'react';

import BtcChart from '../components/BtcChart';
import TradeForm  from '../components/TradeForm';

import Modal from '../components/Modal'
import TradingViewWidget from '../components/TradingViewWidget';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChartClick = () => {
    setIsModalOpen(true);

  }
  const handleCloseModal = () => {
    setIsModalOpen(false);

  }

  return (
    <div className='container-fluid text-center'>
      <div className='row content'>

        <div>
        </div>
        <div className="col-12 col-md-9">
          <div classsName=''>
            <TradingViewWidget />
          </div>
        </div>
        <div className="col-12 col-md-3">
          <TradeForm />
        </div>
      </div>
      


      {/*
      <Modal show={isModalOpen} onClose={handleCloseModal}> 
        <BtcChart />
      </Modal>
      */}

    </div>
  );
};

export default Dashboard;
