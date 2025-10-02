#!/usr/bin/env python3
"""Fix accessibility for select elements by adding id, htmlFor, and aria-label"""

import re

def fix_settings_page():
    """Fix settings/page.tsx"""
    file_path = "src/app/settings/page.tsx"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix first select (login-method)
    content = content.replace(
        '''                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ログイン方法
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  >
                    <option>社内認証システム</option>
                  </select>''',
        '''                <div>
                  <label htmlFor="login-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ログイン方法
                  </label>
                  <select
                    id="login-method"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                    aria-label="ログイン方法を選択"
                  >
                    <option>社内認証システム</option>
                  </select>'''
    )

    # Fix second select (language-setting)
    content = content.replace(
        '''                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    言語設定
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>''',
        '''                <div>
                  <label htmlFor="language-setting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    言語設定
                  </label>
                  <select
                    id="language-setting"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="言語を選択"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>'''
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Fixed {file_path}")

def fix_visibility_page():
    """Fix test/visibility/page.tsx"""
    file_path = "src/app/test/visibility/page.tsx"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix select element
    content = content.replace(
        '''              <div>
                <label className="block text-sm font-medium mb-1">
                  セレクトボックス
                </label>
                <select className="w-full p-2 border rounded">
                  <option>オプション1</option>
                  <option>オプション2</option>
                  <option>オプション3</option>
                </select>''',
        '''              <div>
                <label htmlFor="test-select" className="block text-sm font-medium mb-1">
                  セレクトボックス
                </label>
                <select
                  id="test-select"
                  className="w-full p-2 border rounded"
                  aria-label="テスト用セレクトボックス"
                >
                  <option>オプション1</option>
                  <option>オプション2</option>
                  <option>オプション3</option>
                </select>'''
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Fixed {file_path}")

if __name__ == "__main__":
    import os
    os.chdir("c:/Users/tgch1/Desktop/ZBC-migration-kit/3K-app")

    fix_settings_page()
    fix_visibility_page()

    print("\n🎉 All accessibility fixes applied!")
