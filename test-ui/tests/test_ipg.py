from selenium import webdriver
from selenium.webdriver.chrome import options
import os


# /usr/bin/env python
import pytest
import time
from unittestzero import Assert
from shishito.runtime.shishito_support import ShishitoSupport
from shishito.ui.selenium_support import SeleniumTest
from shishito.conf.conftest import get_test_info
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


@pytest.mark.usefixtures("test_status")
class TestMainPage():
    """ Contextual help test """

    def setup_class(self):
        self.tc = ShishitoSupport().get_test_control()
        print("********* .get_test_control->", self.tc)
        self.driver = self.tc.start_browser()
        #self.ts = SeleniumTest(self.driver)

        #script_dir = os.path.dirname(os.path.realpath(__file__))
        #chrome_options = options.Options()
        #chrome_options.binary_location = script_dir + '/../../IPG-UI/IPG-UI'
        #self.driver = webdriver.Chrome(script_dir + '/../chromedriver', chrome_options = chrome_options)

    def teardown_class(self):
        self.tc.stop_browser()

    def setup_method(self, method):
        self.tc.start_test(True)

    def teardown_method(self, method):
        self.tc.stop_test(get_test_info())

    ### Tests ###
    @pytest.mark.smoke
    def test_register_map(self):
        expected_cell_names = [
            ['VENDORID',     '0x00', '-', '-', '-', '-', '-', '-', '-', '-', '', '', 'R', ''],
            ['REVID',         '0x01', '-', '-', '-', '-', '-', '-', '-', '-', '', '', 'R', ''],
            ['IRQLVL1',       '0x02', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PWRSRCINT',     '0x04', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PMUINT',        '0x05', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['RESETIRQ1',     '0x08', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['RESETIRQ2',     '0x09', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['M_PMUINT',      '0x0B', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['M_PWRSRCINT',   '0x0C', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['M_RESETIRQ1',   '0x11', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['M_RESETIRQ2',   '0x12', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['M_IRQLVL1',     '0x13', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PBCONFIG',      '0x14', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PBSTATUS',      '0x15', '-', '-', '-', '-', '-', '-', '-', '-', '', '', 'R', ''],
            ['PWRSTAT1',      '0x16', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PWRSTAT2',      '0x17', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PGMASK1',       '0x18', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PGMASK2',       '0x19', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VDCNT',         '0x30', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VR5CNT',        '0x31', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VR3CNT',        '0x32', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VACNT',         '0x33', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VR2CNT',        '0x34', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VBCNT',         '0x35', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VR4CNT',        '0x36', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VR1CNT',        '0x37', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VCCNT',         '0x38', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VRMODECTRL',    '0x3B', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['DISCHCNT1',     '0x3C', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['DISCHCNT2',     '0x3D', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['DISCHCNT3',     '0x3E', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['DISCHCNT4',     '0x3F', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PWRGDCNT1',     '0x40', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['REGLOCK',       '0x42', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VRENPINMASK',   '0x43', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['RSTCTRL',       '0x48', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['SDWNCTRL',      '0x49', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VINSNSCTRL',    '0x51', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['ACPWRGDCTRL',   '0x69', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['LOWBATTDET',    '0x6A', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['SPWRSRCINT',    '0x6F', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['CLKCTRL1',      '0xD0', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PWFAULT_MASK1', '0xE5', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PWFAULT_MASK2', '0xE6', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['PGOOD_STAT1',   '0xE7', '-', '-', '-', '-', '-', '-', '-', '-', '', '', 'R', ''],
            ['PGOOD_STAT2',   '0xE8', '-', '-', '-', '-', '-', '-', '-', '-', '', '', 'R', ''],
            ['MISC_BITS',     '0xE9', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['LP_MODE_CTRL',  '0xEA', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['TEMPCRIT',      '0xEB', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['TEMPHOT',       '0xEC', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['OVERCURRENT',   '0xED', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['VREN_PIN_OVR',  '0xEE', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['OTP_SPARE_1',   '0xEF', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', ''],
            ['OTP_SPARE_2',   '0xF0', '-', '-', '-', '-', '-', '-', '-', '-', '', 'W', 'R', '']]

        d = self.driver
        time.sleep(5)
        SelectDevice = d.find_element_by_css_selector('select#selectedDevice')
        s =  webdriver.support.select.Select(SelectDevice)
        print(SelectDevice)
        print(s)
        s.select_by_visible_text('TPS65085x-1.0')
        CreateProjectButton = d.find_element_by_xpath("//button[contains(.,'Create Project')]")
        CreateProjectButton.click()
        time.sleep(2)
        RegisterMap = d.find_element_by_xpath("//app-content/nav/ul/li[contains(.,'Register Map')]")
        RegisterMap.click()
        time.sleep(2)


        RegisterTable = d.find_element_by_xpath("//register-bank--table/table")
        rows = RegisterTable.find_elements_by_xpath("./tbody/tr")

            # Check the names and R/W are correct
        cells = []
        actual_cell_names = []
        for i in range(0, len(rows)):
            cols = rows[i].find_elements_by_xpath("./td")
            cells.append(cols)
            col_names = [c.text for c in cols]
            actual_cell_names.append(col_names)
        assert actual_cell_names == expected_cell_names

            # Check the highlighting works
        a = ActionChains(d)
        a.move_to_element(cells[2][3])
        a.perform()
        cells[2][10].click()
        row_class = rows[2].get_attribute("class");
        assert row_class == 'is-selected'

            # check logical groups for this register
        group_list = d.find_element_by_css_selector('div.ng-scope')
        logical_groups = group_list.find_elements_by_css_selector('logical-group')
        assert len(logical_groups) == 4
        lg_names = [e.find_element_by_css_selector('logical-group--name').text for e in logical_groups]
        assert lg_names == ['RESET', 'PMU', 'PWRSRC', 'PB']

            # find 'Value' input box, enter 0
        inp = cells[2][10].find_element_by_xpath("./input")
        inp.send_keys(Keys.BACK_SPACE + Keys.BACK_SPACE + '0' + Keys.ENTER)
        time.sleep(1)
        assert get_lg_status(logical_groups) == [False, False, False, False]

            # click on #7
        cells[2][2].click()
        time.sleep(1)
        assert inp.get_attribute('value') == '80'
        assert get_lg_status(logical_groups) == [True, False, False, False]

            # click on #5
        cells[2][4].click()
        time.sleep(1)
        assert inp.get_attribute('value') == 'A0'
        assert get_lg_status(logical_groups) == [True, True, False, False]

            # click on #2 #0
        cells[2][7].click()
        cells[2][9].click()
        time.sleep(1)
        assert inp.get_attribute('value') == 'A5'
        assert get_lg_status(logical_groups) == [True, True, True, True]

            # click on #7 #5 #2 #0 -> reset to 0
        cells[2][2].click()
        cells[2][4].click()
        cells[2][7].click()
        cells[2][9].click()
        time.sleep(1)
        assert inp.get_attribute('value') == '00'
        assert get_lg_status(logical_groups) == [False, False, False, False]
        time.sleep(5)

def get_lg_status(logical_groups):
  return [ not e.find_elements_by_css_selector('input')[0].is_selected() for e in logical_groups ]

        

