import {ClientFunction, RequestLogger, Selector} from 'testcafe';
import fs from 'fs';
import { v4 } from 'uuid';

let testSuiteRunId = undefined;
const getLocation = ClientFunction(() => document.location.href);
const script_loader_function = new Function(fs.readFileSync('./test/testcafe/test-snippet.js').toString());
const setProdPerfectCookie = ClientFunction( (id, name, testSuiteRunId, env) => {
  const data = {
    test_run_data: {
      cli_command: env.npm_lifecycle_script,
      test_script_run_id: id,
      test_suite_run_id: testSuiteRunId,
      test_script: name,
      test_suite: env.npm_package_name,
      version: env.npm_package_version
    }
  }
  const jsonData = JSON.stringify(data)
  document.cookie = `prodperfect_test=${jsonData}; path=/`;
});


fixture `Test Page`
  .page `https://cbracco.github.io/html5-test-page/`
  .before( async ctx => {
    testSuiteRunId = v4();
  })
  .beforeEach( async t => {
    const testRun = t.testRun;
    await setProdPerfectCookie(testRun.id, testRun.test.name, testSuiteRunId, process.env);
  });

const logger = RequestLogger('test.datapipe.prodperfect.com');

test.requestHooks(logger)('0 Pageview', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');
  await t.eval(script_loader_function);
  await t.wait(2000);
});

test('1 Click', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');

  await t.eval(script_loader_function);
  await t.wait(2000);
  await t.click('a[href="#text"]');

  await t.eval(script_loader_function);
  await t.wait(2000);
  await t.click('input[value="<input type=button>"]');
  await t.wait(1000);
});

test('2 Form submission', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');

  await t.eval(script_loader_function);
  await t.wait(2000);
  await t.click('input[value="<input type=submit>"]');
  await t.wait(1000);
});

test('3 Input change', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');

  await t.eval(script_loader_function);
  await t.wait(2000);
  await t.typeText('#input__text', 'text');
  await t.typeText('#textarea', 'text');
  await t.wait(1000);
});
