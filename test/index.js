const mainnetParameters = require("../mainnet/parameters.json");
const chai = require("chai");

const { expect, assert } = chai;

const keysWithType = {
  name: "string",
  min: "number",
  max: "number",
  value: "number",
  type: "string" || null,
};

const requiredKeys = Object.keys(keysWithType).sort();

describe("Parameters test", () => {

  it("Parameter should have required keys", () => {
    mainnetParameters.map((param, index) => {
      expect(Object.keys(param).sort()).to.be.eql(
        requiredKeys,
        `Mainnet Parameters ${param.name} does not match with requiredKeys spec`
      );
    });
  });

  it("Parameter keys should match with required datatype", () => {
    mainnetParameters.map((param, index) => {
      Object.keys(param).map((key) => {
        if(key == "type") {
            if(param.name == "buffer" || param.name == "toAssign" || param.name == "maxAge" || param.name == "maxAltBlocks") {
                assert.isNull(param[key], `Mainnet Parameter ${param.name} [${key} ${param[key]}] does match required data type`);
            } else {
                expect(param[key]).to.be.a(
                    "string",
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] does match required data type`
                );
            }
        } else if(key == "value"){
            if(param.name == "slashNums") {
                assert.isObject(param[key], `Mainnet Parameter ${param.name} [${key} ${param[key]}] does match required data type`);
            } else {
                expect(param[key]).to.be.a(
                    keysWithType[key],
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] does match required data type`
                );
            }
        } else {
        expect(param[key]).to.be.a(
            keysWithType[key],
            `Mainnet Parameter ${param.name} [${key} ${param[key]}] does match required data type`
            );
        }
      });
    });
  });

  it("Parameter with Percentage should be within min and max bounds", () => {
    const BASE_DENOMINATOR = 10000000;
    mainnetParameters.map((param, index) => {
    Object.keys(param).map((key) => {
        if(key == "type" && param[key] == "percentage"){
            if(param.name == "deltaCommission" || param.name == "maxCommission"){
                expect((param.value)).to.be.gte(
                    param.min,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
                expect((param.value)).to.be.lte(
                    param.max,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
            } else if(param.name != "slashNums"){
                // use BASE_DENOMINATOR
                expect((param.value/BASE_DENOMINATOR)*100).to.be.gte(
                    param.min,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
                expect((param.value/BASE_DENOMINATOR)*100).to.be.lte(
                    param.max,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
            } else if (param.name == "slashNums") {
                // use BASE_DENOMINATOR
                const {bounty, burn, keep} = param.value;
                const totalPercentage = bounty + burn + keep;

                expect((totalPercentage/BASE_DENOMINATOR)*100).to.be.gte(
                    0,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
                expect((totalPercentage/BASE_DENOMINATOR)*100).to.be.lte(
                    100,
                    `Mainnet Parameter ${param.name} [${key} ${param[key]}] is out of bounds`
                );
            }
        }
        });
    });
  });

  it("Parameter with Tokens should not be much less than or greater than required", () => {
    mainnetParameters.map((param, index) => {
        Object.keys(param).map((key) => {
            if(key == "type" && param[key] == "token"){
                // blockReward not allowed to be greater than genesis block reward
                // allowed to be 0
                if(param.name == "blockReward"){
                    const isGreaterThanMax = param.value > param.max;
                    console.log(`blockReward in RZR:${(param.value/1e18)}`);
                    expect(isGreaterThanMax).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] is higher than max allowed block reward`
                    );
                } else if (param.name == "minStake"){
                    // minStake not allowed to be less than current minStake
                    const isLessThanMin = param.value < param.min;
                    console.log(`minStake in RZR:${(param.value/1e18)}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] is less than the min stake of 1M tokens`
                    );
                } else if(param.name == "minSafeRazor"){
                    // minSafeRazor should not be less than the current min safe razor a validator needs to have staked
                    const isLessThanMin = param.value < param.min; 
                    console.log(`minSafeRazor in RZR:${(param.value/1e18)}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] is less than the min stake of 1M tokens`
                    );
                }
            }
            });
        });
  });

  it("Parameter with Epochs should not be 0 and convert values to hours", () => {
    mainnetParameters.map((param, index) => {
        Object.keys(param).map((key) => {
            if(key == "type" && param[key] == "epoch"){
                if(param.name == "withdrawLockPeriod"){
                    // withdrawLockPeriod should not be 0
                    const isLessThanMin = param.value < param.min;
                    console.log(`withdrawLockPeriod epochs in hours:${(param.value*20)/60}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] should be atleast 1 epoch`
                    );
                } else if (param.name == "withdrawInitiationPeriod"){
                    // withdrawInitiationPeriod should not be 0
                    const isLessThanMin = param.value < param.min;
                    console.log(`withdrawInitiationPeriod epochs in hours:${(param.value*20)/60}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] should be atleast 1 epoch`
                    );
                } else if (param.name == "unstakeLockPeriod"){
                    const isLessThanMin = param.value < param.min;
                    console.log(`unstakeLockPeriod epochs in hours:${(param.value*20)/60}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] should be atleast 1 epoch`
                    );
                } else if(param.name == "epochLimitForUpdateCommission"){
                    const isLessThanMin = param.value < param.min;
                    console.log(`epochLimitForUpdateCommission epochs in hours:${(param.value*20)/60}`);
                    expect(isLessThanMin).to.be.eq(
                        false,
                        `Mainnet Parameter ${param.name} [${key} ${param[key]}] should be atleast 1 epoch`
                    );
                }
            }
            });
        });
  });
});
