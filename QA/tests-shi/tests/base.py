# /usr/bin/env python
from shishito.runtime.shishito_support import ShishitoSupport
from shishito.ui.selenium_support import SeleniumTest
from shishito.conf.conftest import get_test_info
from subprocess import call
import requests
from time import sleep
import os
from tempfile import NamedTemporaryFile
import re


class BaseTestClass():
    """ Contextual help test """


    def setup_class(self):
            # shishito / selenium support
        self.tc = ShishitoSupport().get_test_control()
        self.driver = self.tc.start_browser()
        self.ts = SeleniumTest(self.driver)


    def setup_method(self, method):
        pass


    def teardown_class(self):
        self.tc.stop_browser()

    def teardown_method(self, method):
        self.tc.stop_test(get_test_info())  # save screenshot in case test fails



