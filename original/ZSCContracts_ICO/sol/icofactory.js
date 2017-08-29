pragma solidity ^0.4.11;


contract icofactory {function handleZSCPayment(address _buyer, uint _requiredTokens)  payable returns (bool);}

contract ZSCCrowdsale {
    string public name;
    bool public phasePaused = false;
    icofactory public factory;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public tokensOf;

    uint public amountEthRaised = 0; 
    uint public amountTokenSold = 0; 
    uint public amountTokenRemaining = 0;
    uint public amountTokenMinimal = 16000 ether;

    uint public startTime;
    uint public middleTime;
    uint public deadline; 

    uint mPriceDiscounted;
    uint mPriceNormal;

    modifier onlyFactory {
        if (msg.sender != address(factory)) throw;
        _;
    }

    /// @dev Constructor
    /// @param _name The name of the phase
    /// @param _phaseStartTime The start time of each phase becomes available.
    /// @param _reductionInMinutes The duratin of discounted period in minutes for each phase.
    /// @param _durationInMinutes The duratin in minutes for each phase.
    /// @param _tokensForSale The total ammount of tokens for sale.
    /// @param _priceDiscounted The price during the discounted period, tokens per ether
    /// @param _priceNormal The price during the normal period, tokens per ether 
    function ZSCCrowdsale(
        string _name, 
        uint _phaseStartTime, 
        uint _reductionInMinutes,
        uint _durationInMinutes, 
        uint _tokensForSale, 
        uint _priceDiscounted, 
        uint _priceNormal)
        public
    {
        if (msg.sender == address(0)) throw;

        if (_priceDiscounted < _priceNormal) throw;
        if (_priceDiscounted > 16000) throw;

        name = _name;
        factory = icofactory(msg.sender);

        startTime  = _phaseStartTime;
        middleTime = startTime + _reductionInMinutes * 1 minutes;
        deadline   = startTime + _durationInMinutes * 1 minutes;

        amountTokenRemaining = _tokensForSale;

        mPriceDiscounted = _priceDiscounted;
        mPriceNormal     = _priceNormal;

        balanceOf[this] = _tokensForSale;
    }

    /// @dev Set pause status of the ICO-phase
    /// @param _needPause Does ico-phase need pause or not.
    function setPhasePauseStatus(bool _needPause) 
        public
        onlyFactory
    {
        if (phasePaused != _needPause) {
            phasePaused = _needPause;
        }
    }

    /// @dev Check if the ICO-phase is openned or not
    function phaseOpened() 
        public
        constant
        returns (bool) 
    {
        if (phasePaused) return false;
        if (amountTokenRemaining < amountTokenMinimal) return false;
        uint current = now;
        if (current < startTime) return false;
        if (current > deadline) return false;

        return true;
    }

    /// @dev Different price during different time period.
    function tokensPerEth() 
        internal 
        returns (uint) 
    {
        if (now <= middleTime) {
            return mPriceDiscounted;
        } else {
            return mPriceNormal;
        } 
    }

    /// @dev The function without name is the default function that is called whenever anyone sends funds to a contract.
    function () 
        payable 
    {
        uint amount = msg.value;
        if (amount <= 0) throw;
        if (phaseOpened() == false) throw;

        uint requiredTokens = amount * tokensPerEth();
        if (amountTokenRemaining < requiredTokens) throw;
        if (factory.handleZSCPayment.value(amount)(msg.sender, requiredTokens) == false) throw;

        if (balanceOf[msg.sender] == 0) {
            balanceOf[msg.sender] = amount;
            tokensOf[msg.sender]  = requiredTokens;
        } else {
            balanceOf[msg.sender] += amount;
            tokensOf[msg.sender]  += requiredTokens;
        }
        amountEthRaised      += amount;
        amountTokenSold      += requiredTokens;
        amountTokenRemaining -= requiredTokens;

        balanceOf[this] = amountTokenRemaining;
    }  
}

contract owned {
    address public owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }
}

contract token { function transfer(address receiver, uint amount) returns (bool success);
                 function balanceOf(address _owner) constant returns (uint256);
                 }

contract ZSCIcoFactory is owned {
    ZSCCrowdsale[] public icoPhases;
    mapping (address => bool) public isPhase;
    bool public crowdsaleClosed = false;
    bool public crowdsalePaused = false;

    address public beneficiaryWallet;
    address public beneficiaryTeam;
    address public beneficiaryCongress; 
    token public tokenReward;

    uint public allocatedEthToWallet;
    uint public allocatedEthToTeam;

    uint public totalEthRaised = 0; 
    uint public totalTokenSold = 0; 
    uint public totalTokenRemaining = 0;
    uint public totalTokenMinimal = 16000 ether;

    event FundTransfer(address backer, uint amount, bool isContribution);

    /// @dev Contract constructor 
    function ZSCIcoFactory(
        address _walletAddress,
        address _teamAddress,
        address _congressAddress,
        address _rewardAddress) 
    {
        if (_walletAddress   == address(0)) throw;
        if (_teamAddress     == address(0)) throw;
        if (_congressAddress == address(0)) throw;
        if (_rewardAddress   == address(0)) throw;

        beneficiaryWallet   = _walletAddress;
        beneficiaryTeam     = _teamAddress;
        beneficiaryCongress = _congressAddress;
        tokenReward         = token(_rewardAddress);

        totalTokenRemaining = 0;
    }

    /// @dev This unnamed function is called whenever someone tries to send ether to it 
    function () 
    {
        throw; // Prevents accidental sending of ether
    }

    /// @dev Set the number of tokens for sale
    /// @param _isFromTokenReward Does need to get value from the token reward contract.
    /// @param _tokensForSale The number of tokens for sale.
    function setTokensForSale(bool _isFromTokenReward, uint _tokensForSale) 
        public
        onlyOwner
    {
        if (_isFromTokenReward) {
            totalTokenRemaining = tokenReward.balanceOf(this); 
        } else {
            if (_tokensForSale <= 0) throw;
            totalTokenRemaining = _tokensForSale;
        }
    }

    /// @dev Set the pause status of ico-factory.
    /// @param _isForFactory Is the operation done on ico-factory or ico-phase.
    /// @param _phaseIndex The index of ico-phase.
    /// @param _needPause Does ico-factory or ico-phase need pause or not.
    function setIcoPauseStatus(bool _isForFactory, uint _phaseIndex, bool _needPause) 
        public
        onlyOwner 
    {
        if (_isForFactory) {
            if (crowdsalePaused != _needPause) {
                crowdsalePaused = _needPause;
            }
        } else {
            if (icoPhases[_phaseIndex] != ZSCCrowdsale(0)) {
                icoPhases[_phaseIndex].setPhasePauseStatus(_needPause);
            }
        }
    }

    /// @dev Set the pause status of ico-factory.
    /// @param _walletAddress The address of multisig wallet.
    /// @param _teamAddress The address of wallet used for team fund allocation.
    /// @param _congressAddress The address of multisig token.
    function resetBeneficiaries(address _walletAddress, address _teamAddress, address _congressAddress) 
        public
        onlyOwner 
    {
        if (_walletAddress != address(0)) {
            beneficiaryWallet   = _walletAddress;
        } 

        if (_teamAddress != address(0)) {
            beneficiaryTeam     = _teamAddress;
        }

        if (_congressAddress != address(0)) {
            beneficiaryCongress = _congressAddress;
        }
    }

    /// @dev Register a particular ICO-phase.
    /// @param _name The name of the phase
    /// @param _phaseStartTime The start time of the phase
    /// @param _reductionInMinutes The duratin of discounted period in minutes for the phase.
    /// @param _durationInMinutes The duratin in minutes for the phase.
    /// @param _tokens The number of tokens for sale during the current phase.
    /// @param _priceDiscounted The price during the discounted period in the phases
    /// @param _priceNormal The price during the normal period in the phases
    function registerZSCIcoPhase(
        string _name,
        uint _phaseStartTime, 
        uint _reductionInMinutes,
        uint _durationInMinutes, 
        uint _tokens, 
        uint _priceDiscounted, 
        uint _priceNormal)
        public
        onlyOwner
    {
        if (_tokens == 0) throw;
 
        if (crowdsaleClosed) throw;
        if (crowdsalePaused) throw;
        if (_reductionInMinutes > _durationInMinutes) throw;
        if (_priceDiscounted < _priceNormal) throw;
        if (totalTokenRemaining < _tokens) throw;
        if (_priceDiscounted > 16000) throw;

        ZSCCrowdsale phase = new ZSCCrowdsale(_name, 
                                            _phaseStartTime, _reductionInMinutes, _durationInMinutes, 
                                            _tokens, _priceDiscounted, _priceNormal);
        isPhase[phase] = true;
        icoPhases.push(phase);
    }


    /// @dev Hanndle the payment request from a particular ICO-pahes.
    /// @param _buyer The buyer who has sent the eth to the particular ICO-phase.
    /// @param _requiredTokens The amount of tokens to be sent to the buyer.
    function handleZSCPayment(address _buyer, uint _requiredTokens)
        payable
        returns (bool)
    {
        if (crowdsalePaused) return false;
        if (crowdsaleClosed) return false;
        if (!isPhase[msg.sender]) return false;

        uint amount = msg.value;
        if (amount <= 0) return false;

        if (totalTokenRemaining < _requiredTokens) return false;
        if (_requiredTokens / amount > 16500) return false;

        if (tokenReward.transfer(_buyer, _requiredTokens) == false) return false;
        FundTransfer(_buyer, amount, true);

        totalEthRaised      += amount;
        totalTokenSold      += _requiredTokens;
        totalTokenRemaining -= _requiredTokens;

        uint ethToteam = (amount * 15 / 100); 
        allocatedEthToTeam   += ethToteam;
        allocatedEthToWallet += (amount - ethToteam);

        if (totalTokenRemaining  < totalTokenMinimal) {
            crowdsaleClosed = true;
        }
        return true;
    }

    /// @dev Collect the funded ETHs to multisig eth-wallet.
    /// @param _isFull If collect all of remaining eth for multisig wallet.
    /// @param _amount The amount of eth to be collected.
    function collectToWallet(bool _isFull, uint _amount) 
        public
        onlyOwner 
    {
        if (beneficiaryWallet == address(0)) throw;
        if (_amount > allocatedEthToWallet) throw;

        uint num = 0;
        if (_isFull) num = allocatedEthToWallet;
        else num = _amount;
        
        if (allocatedEthToWallet > 0 && num > 0) {
            if (beneficiaryWallet.call.value(num)()) {
                allocatedEthToWallet -= num;
            } 
        }
    }

    /// @dev Collect the funded ETHs to team wallet.
    /// @param _isFull If collect all of remaining eth for team.
    /// @param _amount The amount of eth to be collected.
    function collectToTeam(bool _isFull, uint _amount) 
        public
        onlyOwner 
    {
        if (beneficiaryTeam == address(0)) throw;
        if (_amount > allocatedEthToTeam) throw;

        uint num = 0;
        if (_isFull) num = allocatedEthToTeam;
        else num = _amount;
        
        if (allocatedEthToTeam > 0 && num > 0) {
            if (beneficiaryTeam.call.value(num)()) {
                allocatedEthToTeam -= num;
            } 
        }
    }

    /// @dev Collect the remaining tokens to congress multisig token-wallet.
    /// @param _isFull If collect all of remaining tokens
    /// @param _amount The amount of tokens to be collected
    function collectToCongress(bool _isFull, uint _amount) 
        public
        onlyOwner 
    {
        if (beneficiaryCongress == address(0)) throw;
        if (_amount > totalTokenRemaining) throw;

        uint num = 0;
        if (_isFull) num = totalTokenRemaining;
        else num = _amount;        

        if (totalTokenRemaining > 0 && num > 0) {
            if (tokenReward.transfer(beneficiaryCongress, num )) {
                totalTokenRemaining -= num;
                if (totalTokenRemaining < totalTokenMinimal) {
                    crowdsaleClosed = true;
                }
            } 
        } 
    }
}

