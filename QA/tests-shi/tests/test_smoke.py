# /usr/bin/env python
import pytest
from shishito.runtime.shishito_support import ShishitoSupport
from shishito.ui.selenium_support import SeleniumTest
from shishito.conf.conftest import get_test_info
from base import BaseTestClass;
from time import sleep


@pytest.mark.usefixtures("test_status")
class TestSmoke(BaseTestClass):

    ### Tests ###
    @pytest.mark.smoke
    def test_smoke(self):
        """ test main page loads """
        d = self.driver
        d.get('http://circlesorg-test.herokuapp.com/')
        sleep(1)
        assert 'Hello, World' in d.page_source

